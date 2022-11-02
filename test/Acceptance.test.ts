import {OurDate} from '../src/OurDate'
import {BirthdayService} from '../src/BirthdayService'
import flushPromises from 'flush-promises'
import {deleteAllMessages, messagesSent} from "./mailhog";

describe('Acceptance', () => {

    let service: BirthdayService

    beforeEach(() => {
        service = new BirthdayService()
    })

    afterEach(async () => {
        await deleteAllMessages()
    })

    it('base scenario', async () => {
        service.sendGreetings(new OurDate('2008/10/08'))
        await flushPromises()

        const messages = await messagesSent()
        expect(messages.length).toEqual(1)
        const message = messages[0]
        expect(message.Content.Body).toEqual('Happy Birthday, dear John!')
        expect(message.Content.Headers.Subject[0]).toEqual('Happy Birthday!')
        const tos = message.Content.Headers.To
        expect(tos.length).toEqual(1)
        expect(tos[0]).toEqual('john.doe@foobar.com')
    })

    it('will not send emails when nobodys birthday', async () => {
        service.sendGreetings(new OurDate('2008/01/01'))
        await flushPromises()

        const messages = await messagesSent()
        expect(messages.length).toEqual(0)
    })
})