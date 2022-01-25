const assert = require('assert')
const DB_functions = require('./DB/DB_functions')

var TestUserData = {
  "name" : "Ivan",
  "surname": "Ivanov"
}

// it('should return true', () => {
//   assert.equal(true, true)
// })

it('Deleting spaces from messages', () => {
  assert.equal(DB_functions.msg_checker("  test message  "), "test message")
})

it('Checking object properties (false)', () => {
  
  assert.equal(DB_functions.data_checker(TestUserData, ["name", "surname", "age"]), false)
})

it('Checking object properties (true)', () => {
  assert.equal(DB_functions.data_checker(TestUserData, ["name", "surname"]), true)
})