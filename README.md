Tool to visualize algorithms in Point Cloud

Requirements:

- Nodejs v22.x
- npm v10.9.3
- [pixi](https://pixi.sh/latest/)

How to install:
```bash
# In the root of the repository
npm install
pixi install
```

How to run:
```bash
# In the root of the repo
# run this to make python dbscan available for the application:
uvicorn src.api.router:app --reload

# In another terminal, run the application:
npm run dev
```