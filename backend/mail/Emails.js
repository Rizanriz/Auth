import { MailtrapClient } from "mailtrap"
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./EmailTemplates.js"
import { sender,client } from "./Mailtrap.js"

export const sendVerificationEmail = async(email,verificationToken)=>{
    const recipient = [{email}]
    try {
        const response = await client.send({  
            from:sender,
            to:recipient,
            subject:"Verify your email",
            html:VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}",verificationToken),
            category:"Email Verification"
        })
        console.log("Email sent successfully",response);
        
    } catch (error) {
        console.error(error)
        throw new Error(`Error senting mail :${error}`)
    }
}

export const sendWelcomeEmail = async (email,name) =>{
    const recipient =[{email}]
    try {
       const responce = await client.send({
            from : sender,
            to : recipient,
            template_uuid : "8133db2f-3100-423f-a8ed-e2580f4bb518",
            template_variables: {
                "company_info_name": "Auth company",
                "name": name
              }
        })

        
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error(`Error sending verification email: ${error.message}`);
    }
}

export const sendPasswordResetEmail = async(email,resetURL) =>{
    const recipient = [{email}]

    try {
        const responce = await client.send({
            from:sender,
            to:recipient,
            subject:"Reset your password",
            html:PASSWORD_RESET_REQUEST_TEMPLATE.replace(/{resetURL}/g,resetURL),
            category:"Password reset"
        })                

    } catch (error) {
        console.error("Error sending password email:", error);
        throw new Error(`Error sending password email: ${error.message}`);
    }
}

export const sendResetSuccessfullEmail = async(email) =>{
    const recipient = [{email}]

    try {
        const responce = await client.send({
            from:sender,
            to:recipient,
            subject:"Password resent successful",
            html:PASSWORD_RESET_SUCCESS_TEMPLATE
        })
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error(`Error sending password reset success email: ${error.message}`);
    }
}