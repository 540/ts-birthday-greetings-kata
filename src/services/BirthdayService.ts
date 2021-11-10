import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { Employee } from 'domain/Employee'
import { OurDate } from 'domain/OurDate'

export class BirthdayService {
    sendGreetings(fileName: string, ourDate: OurDate, smtpHost: string, smtpPort: number) {
        // get employees from file
        const data = fs.readFileSync(path.resolve(__dirname, `../../resources/${fileName}`), 'UTF-8')
        const lines = data.split(/\r?\n/)
        lines.shift()
        const employees = lines.map(line => {
            const employeeData = line.split(', ')
            return new Employee(employeeData[1], employeeData[0], employeeData[2], employeeData[3])
        })

        // filter employees
        const birthdayEmployees = employees.filter(employee => employee.isBirthday(ourDate))

        // send emails
        birthdayEmployees.forEach((employee) => {
            const recipient = employee.getEmail()
            const body = 'Happy Birthday, dear %NAME%!'.replace('%NAME%',
                employee.getFirstName())
            const subject = 'Happy Birthday!'
            this.sendMessage(smtpHost, smtpPort, 'sender@here.com', subject, body, recipient)
        })
    }

    async sendMessage(smtpHost: string, smtpPort: number, sender: string,
        subject: string, body: string, recipient: string) {

        const message = {
            host: smtpHost,
            port: smtpPort,
            from: sender,
            to: [recipient],
            subject,
            text: body
        }

        this.deliveryMessage(message)
    }

    // made protected for testing :-(
    protected async deliveryMessage({host, port, ...msg}: Message) {
        const transport = nodemailer.createTransport({host, port})

        await transport.sendMail(msg)
    }
}

export interface Message extends SMTPTransport.Options, Mail.Options {
}
