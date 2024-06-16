
# Hemophilia Tracker
**Overview:**  
Hemophilia Tracker is a dashboard created for hemophilia patients.
One can observe the degradation of the factor VIII protein and also see the current level of factor in the body.


**Target Audience:**  
This application is perfect for anyone looking to learn more about the behavior of the factor component in the body
**Disclaimer:** 
While Hemophilia Tracker aims to provide helpful insights, it should not be used as medical advice.  
Always discuss the data with your doctor.

## Instalation
### Dependencies
**Create a virtual environment:**
`python3 -m venv venv`

**Install the dependencies:**
`pip install -r requirements.txt`

### Mysql Setup for Ubuntu
**Update the apt package manager:**
`sudo apt update`

**Install mysql (if not already installed):**
`sudo apt install mysql-server`

**Start the mysql server:**
`sudo mysql`

**Withing mysql write the following commands:**
```
CREATE DATABASE hem_tracker;

USE hem_tracker;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255)
    email VARCHAR(255),
    peak_level FLOAT(5,2),
    time_elapsed FLOAT(5,2),
    second_level_measurement FLOAT(5,2),
    weekly_infusions text,
);

CREATE TABLE measurements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    peak_level FLOAT(5,2) NOT NULL,
    time_elapsed FLOAT(5,2) NOT NULL,
    measurement_date VARCHAR(255) NOT NULL,
    second_level_measurement FLOAT(5,2) NOT NULL,
    decay_constant FLOAT(13 ,8) NOT NULL,
    halving_time FLOAT(13 ,8) NOT NULL,
    comment VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE USER 'prod_user'@'localhost' IDENTIFIED BY 'password';

GRANT ALL PRIVILEGES ON hem_tracker.* TO 'prod_user'@'localhost';

FLUSH PRIVILEGES;
```


### Server
**Development server:** 
For testing the changes in a local development environment run `uvicorn backend.app.main:app` and a local server (http://127.0.0.1:8000) will be started.


**Production server:**
The production server is hosted on an Azure Server IP: 137.116.112.226


## Authors
- [@Dragosjosan](https://github.com/Dragosjosan)

