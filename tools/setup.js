const rimraf = require('rimraf')
const chalk = require('chalk')
const replace = require("replace")
const prompt = require("prompt")
const prompts = require('./setupPrompts')

const logSuccess = (message) => {
  console.log(chalk.green(message))
}
const logProcessing = (message) => {
  console.log(chalk.blue(message))
}
const logWarning = (message) => {
  console.log(chalk.red(message))
}

logSuccess('Dependencies installed.')

logWarning('WARNING: Preparing to delete local git repository...')

prompt.get([{name: 'deleteGit', description: 'Delete the git repository? [Y/n]'}], function (err, result) {
  const deleteGit = result.deleteGit.toUpperCase()

  if (err) {
    process.exit(1)
  }

  function updatePackage() {
    logProcessing('Updating package.json settings:')

    prompt.get(prompts, function (err, result) {
      const responses = [
        {
          key: 'name',
          value: result.projectName || 'new-project'
        },
        {
          key: 'author',
          value: result.author
        },
        {
          key: 'description',
          value: result.description
        },
        {
          key: 'url',
          value: ''
        }
      ]

      responses.forEach(res => {
        replace({
          regex:`("${res.key}"): "(.*?)"`,
          replacement: `$1: "${res.value}"`,
          paths: ['package.json'],
          recursive: false,
          silent: true
        })
      })

      replace({
        regex: /"keywords": \[[\s\S]+?\]/,
        replacement: `"keywords": []`,
        paths: ['package.json'],
        recursive: false,
        silent: true
      })

      logSuccess('\nSetup complete! Cleaning up...\n')
      rimraf('./tools', error => {
        if (error) throw new Error(error);
      })
    })
  }

  if (deleteGit.match(/^N./)) {
    updatePackage()
  } else {
    rimraf('.git', error => {
      if (error) throw new Error(error)
      logSuccess('Original Git repository removed.\n')
      updatePackage()
    })
  }
})

