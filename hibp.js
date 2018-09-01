/*

Checks if an email has been pwned via HaveIBeenPwned API, currently implemented as a Twilio function

Instructions:
1. Create Twilio Function with the code below
2. Add the `hibp` package to your Twilio Function's dependencies (version 7.1.3 as of this writing)
3. Purchase phone number and configure the inbound messaging to use your Twilio Function

*/

const hibp = require('hibp')

exports.handler = function(context, event, callback) {
  let twiml = new Twilio.twiml.MessagingResponse()
  let email = event.Body
  
  hibp.search(email).then(data => {
    if (data.breaches === null || data.breaches.length === 0) {
        twiml.message('Good news — nothing found!')
        return callback(null, twiml)
    }

    const breachesSorted = data.breaches.sort((a, b) => a.BreachDate.slice(0, 4) - b.BreachDate.slice(0, 4))
    const breachesMapped = breachesSorted.map(e => {
      let name = e.Name
      let year = e.BreachDate.slice(0, 4)
      let data = e.DataClasses.join(', ')
      return `${name} (${year})\n${data}`
    })

    twiml.message(breachesMapped.join('\n\n'))
    callback(null, twiml)
  })
}
