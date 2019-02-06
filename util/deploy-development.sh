echo "Deploy development script v0.0.1"

export TARGET_BRANCH=$1
export CURRENT_BRANCH=$(git branch | grep \* | cut -d ' ' -f2)

echo "Current branch: ${CURRENT_BRANCH}"

if [ -z "${TARGET_BRANCH}" ]; then
    echo "Target branch not set. e.g. 'yarn push [staging|production]'"
    exit 1
fi

if [ ${TARGET_BRANCH} = "staging" ] || [ ${TARGET_BRANCH} = "production" ]; then
    echo "Merging 'development' -> '${TARGET_BRANCH}' branch" 

    read -p "Are you sure you wish to continue? (y/n) Warning: This script will delete local branch '${TARGET_BRANCH}'" -n 1 -r

    echo    # (optional) move to a new line

    
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        # do dangerous stuff
        git branch -d ${TARGET_BRANCH}
        git checkout -b ${TARGET_BRANCH}
        git pull origin ${TARGET_BRANCH}
        git pull origin development
        git push origin ${TARGET_BRANCH}

        git checkout ${CURRENT_BRANCH}
        
        # delete branch after use
        git branch -d ${TARGET_BRANCH}

    else
        echo "Operation cancelled!"
    fi
    
fi

