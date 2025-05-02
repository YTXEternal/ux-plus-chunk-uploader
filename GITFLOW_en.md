**Clone the project to your local machine**

## Initialize Workflow

```cmd
git flow init
```



## master

Do not make direct modifications or push directly to this branch. When you need to fix bugs, create a new HOTFIX/* branch based on this branch for bug fixing.



## develop

**Created based on the master branch.**

If you already have a develop branch locally, before coding, pull and merge the latest develop branch.

```cmd
Ensure you are on the develop branch.
git checkout develop
Pull updates from GitHub.
git pull origin develop
```

If it does not exist, create one yourself:

```cmd
git checkout -b develop
```

Note: Do not make direct modifications on this branch. When you need to add new features, create a new feature/* branch based on this develop branch for development.



## feature/*

***Represents any name that fits the context of your development or modification.**

Created based on the develop branch.

This branch is used for developing new features.

For example, if you want to develop a getData function, create a feature/getData branch and start developing on this branch.

```cmd
This command creates the feature/getData branch.
git flow feature start getData

...

Once your feature is complete and has undergone actual testing and unit tests, you can proceed to commit.
pnpm commit
Push your feature branch to GitHub and wait for my approval. Once approved, continue with the following steps.
git push origin feature/getData 
(After approval)
git flow feature finish getData  // This operation will directly merge into the develop branch 
```



## hotfix/*

***Version number such as v3.0.2**

Created based on the master branch.

This branch is used for bug fixing.

```cmd
git flow hotfix start v3.0.2  // This command creates the hotfix/v3.0.2 branch 

...

After fixing,
pnpm commit
Push this branch to GitHub (make sure to perform actual testing and unit tests beforehand).
git push origin hotfix/v3.0.2

Wait for my approval on your submission before proceeding.
Merge back into master and develop branches, and tag the version.
git flow hotfix finish v3.0.2
git push origin v3.0.2
```



## release/*

***Version number such as v3.0.0**

Created based on the develop branch.

This branch is used for releasing new versions.

When the develop branch is completed and ready for a new version release, you can create a new release branch like v3.0.0.

```cmd
git flow release start v3.0.0  // This command creates the release/v3.0.0 branch 

...

Upon completion,
git push origin release/v3.0.0

// Wait for approval before proceeding
git flow release finish v3.0.0
git push origin v3.0.0
```



## chore/*

***Represents any name that fits the context of your development or modification.**

Created based on the develop branch.

This branch is used for adding documentation, correcting documentation, removing redundant dependencies, etc.

```cmd
Create
git checkout -b chore/*

...

Upon completion of this branch:
Commit the updated content (note to follow the prompts for writing content).
pnpm commit  
Push the branch to GitHub for my review. If approved, continue with the following steps.
git push origin chore/*

After approval, continue by:
git checkout develop
First, pull to ensure you have the latest code.
git pull origin develop
git merge chore/*
```