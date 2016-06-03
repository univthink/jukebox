# jukebox-web

```
gulp serve
```

Navigate to `localhost:8080` for the web app.
Navigate to `localhost:8080/api` for the api endpoint debugger.

Make sure to install the [LiveReload plugin](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei/related) for Chrome.

Visit our [Slack channel](https://jukebox-app.slack.com/) for support.

Ensure that remote has lasted `deployed` branch:
```
git rebase master
gulp && gulp dist
git push origin deployed --force
```

Try not to run `gulp dist` on master or you'll have to deal with merging everything in `dist/`.

To deploy:
```
appcfg.py update ./ # from root dir
```

To set up:
```
pip install requests
pip install urllib3
npm install
```