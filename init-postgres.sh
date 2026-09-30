#!/bin/sh
set -e

echo "Database initialization begins..." 

sudo -u postgres env POSTGRES_PASSWORD="$POSTGRES_PASSWORD" psql <<EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'odl_project') THEN
        CREATE USER odl_project WITH ENCRYPTED PASSWORD '$POSTGRES_PASSWORD';
    ELSE
        ALTER USER odl_project WITH ENCRYPTED PASSWORD '$POSTGRES_PASSWORD';
    END IF;
END
\$\$;


SELECT 'CREATE DATABASE odl_project OWNER odl_project'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'odl_project')\gexec

SELECT 'CREATE DATABASE odl_project_test OWNER odl_project'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'odl_project_test')\gexec

GRANT ALL PRIVILEGES ON DATABASE odl_project TO odl_project;
GRANT ALL PRIVILEGES ON DATABASE odl_project_test TO odl_project;
EOF

echo "Done."
