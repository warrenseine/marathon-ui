## Marathon (Criteo version)

This version contains criteo specific changes.
It is very likely usable somewhere else since all changes are reversable upstream.

## How-to develop

If you are familiar with npm and all the toolset, do whatever you are used to.

For complete beginners (like me):
- install docker-compose
- run `docker-compose up -d`
- check `docker-compose ps`, everything should be up

You can access marathon UI bundled with marathon on http://localhost:8080.

To access **your local marathon ui**, use http://localhost:8081/dev.

http://localhost:8080 expose a version of marathon ui that you have built outside of docker (you don't need to)
