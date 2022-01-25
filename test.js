const assert = require('assert')
const { Test } = require('mocha')
const DB_functions = require('./DB/DB_functions')
const to_int = require('./DB/Tables/Auth').to_int

let TestUserData = {
  "name" : "Ivan",
  "surname": "Ivanov"
}

// it('should return true', () => {
//   assert.equal(true, true)
// })

it('String to int converting - Empty string input', () => {
  assert.equal(DB_functions.to_int(""), 0)
})

it('String to int converting - 1 digit number', () => {
  assert.equal(DB_functions.to_int("5"), 5)
})

it('String to int converting - 3 digit number', () => {
  assert.equal(DB_functions.to_int("534"), 534)
})

it('Deleting spaces from messages', () => {
  assert.equal(DB_functions.msg_checker("  test message  "), "test message")
})

it('Checking object properties - false', () => {
  assert.equal(DB_functions.data_checker(TestUserData, ["name", "surname", "age"]), false)
})

it('Checking object properties - true', () => {
  assert.equal(DB_functions.data_checker(TestUserData, ["name", "surname"]), true)
})

it('Filling missing properties with empty strings', () => {
  assert.equal("name" in DB_functions.propper({}, ["name"]), true)
})