#!/usr/bin/python3

import bottle
from gevent import monkey; monkey.patch_all()
from bottle import response, request, template
from bottle import static_file
import bottle_session
import json
import requests
import grequests
import logging
import logging.config
import settings
import backend


# the decorator
def enable_cors(fn):
    def _enable_cors(*args, **kwargs):
        # set CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

        if bottle.request.method != 'OPTIONS':
            # actual request; reply with the actual response
            return fn(*args, **kwargs)

    logger = logging.getLogger(__name__)
    logger.debug("enabling cors now")
    return _enable_cors


app = bottle.app()


@app.route('/index')
@app.route('/')
def index():
    logger.debug(" I'm in index")
    return template('index.html')


@app.route('/login')
def test_login():
    logger.debug(" I'm in test_login")
    return template('login.html')


@app.route('/check_url')
def check_url():
    logger = logging.getLogger(__name__)
    url = request.query.url
    logger.debug("URL is" + url)
    response.add_header("Exists", True)
    r = requests.get(url)
    response.status = r.status_code


@app.route('/static/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root=settings.ROOT_DIR+"/static")


@app.route('/blank')
def test_via_js():
    return


def main():
    app.run(
        host='localhost',
        port=settings.PORT,
        debug=settings.DEBUG,
        reloader=settings.RELOADER,
        server='gevent'
    )

if __name__ == "__main__":
    logging.config.fileConfig(settings.LOG_CONFIG_FILE)
    logger = logging.getLogger(__name__)
    main()
