let express = require("express");
let router = express.Router();
const path = require("path");
const fs = require("fs");

const multer = require("multer");

const dir = path.resolve(__dirname, "../uploads");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const wait = (n) =>
  new Promise((r) => {
    setTimeout(() => {
      r();
    }, n);
  });

// 获取分片
router.get("/chunks", async (req, res) => {
  try {
    if (!req.query.hash) {
      return res.json({
        code: 400,
        data: [],
        message: "",
      });
    }

    // await wait(5000);
    const { hash } = req.query;

    const fullPath = path.resolve(dir, hash);
    const r = fs.existsSync(fullPath);

    if (!r)
      return res.json({
        code: 200,
        message: "",
        data: [],
      });

    const chunks = fs.readdirSync(fullPath, {
      encoding: "utf8",
      withFileTypes: true,
    });

    res.json({
      code: 200,
      message: "success",
      data: chunks.map((v) => v.name),
    });
  } catch (err) {
    console.log("err", err.message);
  }
});

// 保存分片
router.post("/uploadchunk", upload.single("chunk"), async (req, res) => {
  if (!req.file) {
    return res.json({
      code: 400,
      message: "文件不存在",
    });
  }
  const writeFileStream = () =>
    new Promise((resolve, reject) => {
      let currentDir = path.resolve(dir, req.body.dirname);
      const exist = fs.existsSync(currentDir);
      if (!exist) {
        fs.mkdirSync(currentDir, {
          recursive: true,
        });
      }
      const regex = /(?<=\_)\d+(?=\.)/;
      const r = regex.exec(req.body.chunkname);
      const i = +r[0];
      // 测试条件{n}个切片失败
      if (0) {
        return res.json({
          code: 400,
          message: "上传失败",
        });
      }
      const fullPath = path.resolve(dir, req.body.dirname, req.body.chunkname);
      const writeStream = fs.createWriteStream(fullPath);
      writeStream.write(req.file.buffer);
      writeStream.on("finish", () => {
        writeStream.close();
        resolve();
      });

      writeStream.on("error", (err) => {
        writeStream.close();
        reject(err);
      });
      resolve();
    });

  try {
    await writeFileStream();
  } catch (err) {
    console.log("err", err);
    return res.json({
      code: 200,
      message: "分片保存失败",
    });
  }
  console.log("res");
  res.json({
    code: 200,
    message: "分片保存成功",
  });
});

const localRmdirAll = (fullPath) => {
  const list = fs.readdirSync(fullPath, {
    withFileTypes: true,
  });
  const func = (files, fullPath) => {
    files.forEach((v) => {
      if (v.isDirectory()) {
        const currentPath = path.resolve(v.path, v.name);
        const L = fs.readdirSync(currentPath, {
          withFileTypes: true,
        });
        if (L.length === 0) return;
        func(L, currentPath);
      } else {
        const currentPath = path.resolve(v.path, v.name);
        fs.unlinkSync(currentPath);
      }
    });
  };
  func(list);
  fs.rmdirSync(fullPath);
};
// 合并分片
router.post("/mergechunks", async (req, res) => {
  const { hash, filename, chunkcount } = req.body;
  if (!hash || !filename || typeof chunkcount !== "number") {
    return res.json({
      code: 400,
      message: "合并失败",
    });
  }

  // 把上传的切片删除
  if (1) {
    const rootPath = path.resolve(__dirname, `../uploads/${hash}`);
    localRmdirAll(rootPath);
    return res.json({
      code: 200,
      message: "成功",
    });
  }

  const fullDir = path.resolve(dir, hash);
  const exist = fs.existsSync(fullDir);
  if (!exist)
    return res.json({
      code: 400,
      message: "合并失败",
    });

  const findLastIndex = (str) => {
    const regex = /(?<=\_)\d+(?=\.)/;
    const r = regex.exec(str);
    return +r[0];
  };
  const chunks = fs
    .readdirSync(fullDir)
    .sort((a, b) => {
      const a_i = findLastIndex(a);
      const b_i = findLastIndex(b);
      return a_i - b_i;
    })
    .map((v) => path.resolve(fullDir, v));
  console.log("chunks", chunks);
  const targetUrl = path.resolve(dir, filename);
  let total = chunks.length;

  // 校验分片一致性
  console.log("校验一致性");
  if (chunkcount !== total)
    return res.json({
      code: 400,
      message: "合并失败",
    });

  // 判断是否存在
  const isflag = fs.existsSync(targetUrl);
  if (isflag) {
    fs.rmSync(targetUrl);
  }

  const merge = () =>
    new Promise(async (resolve, reject) => {
      const writeStream = fs.createWriteStream(targetUrl, {
        flags: "a",
      }); // 使用追加模式 'a' 来合并文件
      const func = (task) =>
        new Promise((resolve, reject) => {
          const readStream = fs.createReadStream(task);

          readStream.on("end", () => {
            resolve();
          });
          readStream.on("error", (err) => {
            console.error("Error reading stream:", err);
            reject(err);
          });

          // 确保不会关闭 writeStream 直到所有切片都写入完毕
          readStream.pipe(writeStream, { end: false });
        });

      try {
        for (const v of chunks) {
          await func(v);
        }
        // 所有切片都写入后关闭 writeStream
        writeStream.end();
        writeStream.on("finish", () => {
          resolve();
        });
        writeStream.on("error", (err) => {
          console.error("Error writing to stream:", err);
          reject(err);
        });
      } catch (err) {
        // 如果在合并过程中发生错误，关闭 writeStream 并拒绝 Promise
        writeStream.end();
        reject(err);
      }
    });
  await merge();

  const unlinks = () => {
    for (const v of chunks) {
      try {
        fs.unlinkSync(v, {
          recursive: true,
          force: true,
        });
      } catch (err) {
        console.log("err", err);
      }
    }
  };

  unlinks();

  res.json({
    code: 200,
    message: "合并成功",
  });
});

module.exports = router;
