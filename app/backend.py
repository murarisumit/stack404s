import requests
import logging
import json
import os

import settings


def fetch_user(access_token=''):
    '''
    Fetch the user details

    Returns: Dictionary with user details
    '''
    logger = logging.getLogger(__name__)
    if access_token:
        response = requests.get(
            settings.API_ENDPOINT + settings.API_VERSION +
            "/me?site=stackoverflow&access_token=" +
            access_token + "&key=" + settings.KEY
        )
        logger.debug(response.status_code)
        user = {}
        if response.status_code == 200:
            response_native = json.loads(response.text)
            user['account_id'] = response_native['items'][0]['account_id']
            user['user_id'] = response_native['items'][0]['account_id']
            user['image_url'] = response_native['items'][0]['profile_image']
            user['reputation'] = response_native['items'][0]['reputation']
            user['link'] = response_native['items'][0]['link']
            logger.debug("User details: " + str(user))
            return user
    else:
        logger.error("No access_token found to fetch user_details")


def fetch_all_answerids(access_token=''):
    '''
    Fetch all the answer_ids corresponding to user, linked with access_token

    Returns: [list_of_answer_ids]
    '''
    logger = logging.getLogger(__name__)
    url = settings.API_ENDPOINT + settings.API_VERSION + "/me/answers"

    querystring = {
        "access_token": access_token,
        "site": "stackoverflow",
        "key": settings.KEY
        }

    headers = {'cache-control': 'no-cache'}
    response = requests.request(
        "GET",
        url,
        headers=headers,
        params=querystring
        )
    logger.debug("Status code is: " + str(response.status_code))
    if response.status_code == 200:
        response_native = json.loads(response.text)
        answer_ids = []
        for item in response_native['items']:
            answer_ids.append(item.get('answer_id'))
        if answer_ids:
            logger.debug("Answers are: " + str(answer_ids))
            return answer_ids
        else:
            logger.debug("No answer found for user.")
            return None


def check_if_answer_has_404(access_token='', answer_id=''):
    url = settings.API_ENDPOINT + settings.API_VERSION + "answers/" + answer_id
    querystring = {
        "access_token": access_token,
        "site": "stackoverflow",
        "key": settings.KEY,
        "filter": "withbody"
        }

    headers = {'cache-control': 'no-cache'}
    response = requests.request(
        "GET", url,
        headers=headers,
        params=querystring)
    logger.debug("Status code is: " + str(response.status_code))
    if response.status_code == 200:
        response_native = json.loads(response.text)
        if answer in response_native['items'][0]:
            answer = response_native['items'][0]
            logger.debug(answer)

