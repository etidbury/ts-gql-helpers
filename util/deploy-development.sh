#!/bin/bash -exo pipefail

echo "Deploy development script v0.0.3"

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
        # git branch -d ${TARGET_BRANCH}
        # git checkout -b ${TARGET_BRANCH}
        # git pull origin ${TARGET_BRANCH}
        # git pull origin development
        # git push origin ${TARGET_BRANCH}

        # git checkout ${CURRENT_BRANCH}
        
        # # delete branch after use
        # git branch -d ${TARGET_BRANCH}


        ##---------------------------------------



        export TMP_DEV_BRANCH="development-build-deploy2"

        git branch -D ${TARGET_BRANCH}
        git branch -D ${TMP_DEV_BRANCH}


        git checkout development
        git pull origin development

        # Setup and sync target branch
        git checkout -B ${TARGET_BRANCH}
        git pull origin ${TARGET_BRANCH}

        git reset --hard HEAD
        # || (git push -u origin ${TARGET_BRANCH} && echo "'${TARGET_BRANCH}' branch was created on remote")
        
        # make merge commit but without conflicts!!
        # the contents of 'ours' will be discarded later
        git merge -s ours development

        # Clone branch being updated with a temporary branch
        echo "Setup temporary branch: '${TMP_DEV_BRANCH}'"
        
        git checkout -B ${TMP_DEV_BRANCH}

        # get contents of working tree and index to the development branch
        git reset --hard development

        # reset to our merged commit but 
        # keep contents of working tree and index
        git reset --soft ${TMP_DEV_BRANCH}

        git push origin ${TARGET_BRANCH}

        git checkout ${CURRENT_BRANCH}
        
        git branch -D ${TARGET_BRANCH}
        git branch -D ${TMP_DEV_BRANCH}

   

    else
        echo "Operation cancelled!"
    fi
    
fi

