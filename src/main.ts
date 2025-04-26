import "./style.css";
import { setupUploader } from "./upload";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<div><input type="file" id="uploader"/></div><div><button id="terminate">终止上传</button></div>
`;

setupUploader();
