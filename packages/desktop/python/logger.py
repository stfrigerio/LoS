import logging
import socket

hostname = socket.gethostname()
service_name = "ai-helpers"
environment = "development"

def setup_logging():
    # Create a logger
    logger = logging.getLogger(service_name)
    logger.setLevel(logging.INFO)  # Set the default logging level

    # Create a console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)  # Set the logging level for the console

    # Create a formatter and add it to the handler
    formatter = logging.Formatter('%(levelname)s - %(filename)s - %(funcName)s - %(message)s')
    # formatter = logging.Formatter('%(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)

    # Add the handler to the logger
    logger.addHandler(console_handler)

    return logger

logger = setup_logging()
