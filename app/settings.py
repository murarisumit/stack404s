import os
import configparser
import sys

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_ROOT = os.path.join(ROOT_DIR, 'conf')

config = configparser.ConfigParser()
DEFAULT_SECTION = "DEFAULT_VARS"
# BASEDIR = os.path.dirname(os.path.realpath(__file__))
CONFIG_FILE = os.path.join(CONFIG_ROOT + '/config.ini')
LOG_CONFIG_FILE = os.path.join(CONFIG_ROOT + '/logging.conf')
config.read(CONFIG_FILE)


default = DEFAULT_SECTION
PORT = config.get(default, 'PORT')
DEBUG = config.get(default, 'DEBUG')
RELOADER = config.get(default, 'RELOADER')
