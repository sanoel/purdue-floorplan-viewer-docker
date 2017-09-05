Running the floorplan viewer docker
==================

1. `git clone ssh://git@github.com/sanoel/purdue-floorplan-viewer-docker`
2. `cd purdue-floorplan-viewer-docker`
3. `docker-compose build`
3. `docker-compose run yarn`
4. `docker-compose up -d`

Initializing the database
==================
1. `docker-compose run --rm admin`
2. `cd resources`
3. `node main.js`

