Tool to visualize algorithms in Point Cloud

# Requirements:

- Nodejs v24.x
- [pixi](https://pixi.sh/latest/)

# How to install:
```bash
# In the root of the repository
npm install
pixi install
```

# How to run:
```bash
# Backend: In the root of the repo, inside the pixi environment
uvicorn src.api.router:app --reload

# In another terminal, run the application:
npm run dev
```
# Troubleshoots
## How can I make available my application in local network when using WSL
You need to expose the two used ports to Windows through these commands:
```bash
# Frontend
netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=<YOUR_WSL_ADDRESS>

# Backend
netsh interface portproxy add v4tov4 listenport=8001 listenaddress=0.0.0.0 connectport=8001 connectaddress=<YOUR_WSL_ADDRESS>
```