'use strict'

const debug = require('debug')('mocked-env')
const R = require('ramda')
const la = require('lazy-ass')
const is = require('check-more-types')

const mockEnv = changeVariables => {
  debug('will be mocking env variables')
  debug(changeVariables)
  la(
    is.object(changeVariables),
    'expected first argument to be an object of env variables',
    changeVariables
  )

  const changedVariableNames = R.keys(changeVariables)

  R.forEach(name => {
    const value = changeVariables[name]
    la(
      value === undefined || is.string(value),
      'process.env values should always be strings.',
      'found invalid property',
      name,
      'with value of type',
      typeof value
    )
  }, changedVariableNames)

  // make sure we even keep undefined values
  const savedValues = R.pickAll(changedVariableNames, process.env)

  // change variables
  R.forEach(name => {
    const value = changeVariables[name]
    if (value === undefined) {
      debug('deleting variable', name)
      delete process.env[name]
    } else {
      process.env[name] = changeVariables[name]
    }
  }, changedVariableNames)

  function restoreProcessEnv () {
    debug('restoring env variables', changedVariableNames)
    R.forEach(savedVariableName => {
      const value = savedValues[savedVariableName]
      if (value === undefined) {
        debug('deleting %s', savedVariableName)
        delete process.env[savedVariableName]
      } else {
        debug('restoring %s to value %j', savedVariableName, value)
        process.env[savedVariableName] = value
      }
    }, R.keys(savedValues))
  }

  return restoreProcessEnv
}

module.exports = mockEnv