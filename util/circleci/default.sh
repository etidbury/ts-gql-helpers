#!/bin/bash -exo pipefail

echo "Deployment v0.1.0"

export GITHUB_REPO_URL="https://${GITHUB_TOKEN}@github.com/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}.git"

if [ "${CIRCLE_BRANCH}" == "development" ]; then

    echo "Deployment for development not yet implemented..."

elif [ "${CIRCLE_BRANCH}" == "staging" ]; then

    echo "Deployment for staging not yet implemented..."

elif [ "${CIRCLE_BRANCH}" == "production" ]; then

    echo "Deployment for production not yet implemented..."
    
else

    set -exo pipefail

    export TMP_DEV_BRANCH="${CIRCLE_BRANCH}-build-${CIRCLE_BUILD_NUM}"
    export TARGET_BRANCH="development"

    # print current branches
    git branch -a

    # Register repo
    git remote -v
    git remote rm origin
    git remote add origin ${GITHUB_REPO_URL}
    git remote -v

    # Setup and sync target branch
    git checkout ${TARGET_BRANCH} || git checkout -B ${TARGET_BRANCH}
    git reset --hard HEAD
    git fetch origin ${TARGET_BRANCH} || (git push -u origin ${TARGET_BRANCH} && echo "'${TARGET_BRANCH}' branch was created on remote")
    git merge origin/${TARGET_BRANCH} || echo "No remote changes to merge"

    # merge remote target branch into local
    git add .
    git commit -am "Merge '${TARGET_BRANCH}' into local branch" || echo "Nothing to commit"

    # Clone branch being updated with a temporary branch
    echo "Setup temporary branch: ${TMP_DEV_BRANCH}"
    git checkout -B ${TMP_DEV_BRANCH}
    git merge ${CIRCLE_BRANCH}

    # Initialise project
    yarn
    yarn build

    # Initialise DB
    # yarn db:migrate
    # yarn db:seed

    # test new changes
    yarn test:ci


    # save new changes to target branch
    git add .
    git commit -am "Merge new build changes (Build ${CIRCLE_BUILD_NUM})" || echo "Nothing to commit"

    git checkout ${TARGET_BRANCH}
    git merge ${TMP_DEV_BRANCH}

    git push origin ${TARGET_BRANCH}

    # delete tmp branch
    git branch -d ${TMP_DEV_BRANCH}

fi

#### Deploy via Zeit Now
if [ -z "${NOW_ALIAS}" ] || [ -z "${NOW_TOKEN}" ] || [ -z "${NOW_TEAM}" ]; then
    echo 'Skipping Zeit Now Deploy ( NOW_ALIAS, NOW_TOKEN, NOW_TEAM not set )'        
else

    set -exo pipefail

    
    # Save all env vars from shell environment to .env file
    printenv | awk '!/PATH=/ && !/HOME=/ && !/PORT=/ && !/HOST=/ && !/CWD=/ && !/PWD=/' > .env

    # re-add deleted env vars
    if [ -z "${MYSQL_HOST}" ];then
        echo "MYSQL_HOST=$MYSQL_HOST" >> .env
    fi
    # Debug env vars
    cat .env

    # Debug files and permissions
    ls -la

    echo "Zeit Now Deploying '${NOW_ALIAS}'..."

    export NOW_TEMP_URL=$(now --token "${NOW_TOKEN}" -E -e HOST='0.0.0.0' -e PORT='3009' --dotenv --team "${NOW_TEAM}")

    echo "Zeit Now Aliasing '${NOW_TEMP_URL}' to '${NOW_ALIAS}'"

    now alias "${NOW_TEMP_URL}" "${NOW_ALIAS}" --token "${NOW_TOKEN}" --team "${NOW_TEAM}"

    if [ -z "${NOW_SCALE}" ]; then
        echo "Skipping scale command (NOW_SCALE not set)"
    else
        echo "Scaling ${NOW_ALIAS} [Min: 1, Max: ${NOW_SCALE}]"
        now scale "${NOW_ALIAS}" "1" "${NOW_SCALE}" --token "${NOW_TOKEN}" --team "${NOW_TEAM}"
    fi

    curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"Deployed ${CIRCLE_PROJECT_REPONAME} at https://${NOW_ALIAS} (${NOW_TEMP_URL})\"}" https://hooks.slack.com/services/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

fi

