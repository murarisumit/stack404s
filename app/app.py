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


@app.route('/')
def home(session):
    access_token = session.get('token')
    if access_token is not None:
        logger.debug("Token is : " + access_token)
        backend.fetch_user(access_token)
        response.set_cookie(
            'access_token',
            access_token,
            )
        return template('index.html', redirect_uri=settings.REDIRECT_URI)
    else:
        return template('login.html', redirect_uri=settings.REDIRECT_URI)


@app.route('/answers')
def get_answer_ids(session):
    access_token = session.get('token')
    if access_token is None:
        redirect('/')
    access_token = session.get('token')
    answer_ids = backend.fetch_all_answerids(access_token)
    if answer_ids:
        response.content_type = 'application/json'
        return json.dumps(answer_ids)
    return None


@app.route('/redirect')
def get_token(session):
    code = request.query.code
    payload = {
        'code': code,
        "client_id": settings.CLIENT_ID,
        "client_secret": settings.CLIENT_SECRET,
        "redirect_uri": settings.REDIRECT_URI
    }
    auth_rqst = requests.post(
        "https://stackexchange.com/oauth/access_token",
        data=payload
    )
    access_token, expires = auth_rqst.text.split('&')
    logger.debug(auth_rqst.text)
    session['token'] = access_token.split('=')[1]
    logging.debug("Token is: " + session['token'])
    redirect("/")


@app.route('/static/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root=settings.ROOT_DIR+"/static")


@app.route('/test_login')
def test_login():
    logger.debug(" I'm in test_login")
    return template('test_login.html')


@app.route('/test_index')
@enable_cors
def test_index():
    logger.debug(" I'm in test_index")
    return template('test_index.html')


@app.route('/check_url')
def check_url():
    logger = logging.getLogger(__name__)
    url = request.query.url
    logger.debug("URL is" + url)
    response.add_header("Exists", True)
    r = requests.get(url)
    response.status = r.status_code


@app.route('/blank')
def test_via_js():
    return


def main():
    plugin = bottle_session.SessionPlugin(cookie_lifetime=600)
    app.install(plugin)
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
