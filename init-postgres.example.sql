CREATE USER odl_project WITH ENCRYPTED PASSWORD '[user-password]';
CREATE DATABASE odl_project OWNER odl_project;
CREATE DATABASE odl_project_test OWNER odl_project;
GRANT ALL PRIVILEGES ON DATABASE odl_project TO odl_project;
GRANT ALL PRIVILEGES ON DATABASE odl_project_test TO odl_project;
