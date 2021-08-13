/**
 * Wechaty - Conversational RPA SDK for Chatbot Makers.
 *  - https://github.com/wechaty/wechaty
 */
import {
  Contact,
  Message,
  ScanStatus,
  Wechaty,
  log,
}                  from 'wechaty'

import { generate } from 'qrcode-terminal'

require('dotenv').config()

var EndString = '咩呀'

var MegSwitch = false
var ChangingEndString = false
var DebugSwitch = false
var SetRangeSwitch = false
// 0-addtalker, 1-addroom, 2-deltalker, 3-delroom
var CurrentSetRangeType = -1
var nodejieba =require("nodejieba")

var talkerlist = new Array()
var roomlist = new Array()


function onLogout (user: Contact) {
  log.info('StarterBot', '%s logout', user)
}

function onScan (qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    generate(qrcode, { small: true })  // show qrcode on console

    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')

    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)
  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin (user: Contact) {
  roomlist.push('干饭人的')
  log.info('StarterBot', '%s login', user)
}

async function onMessage (msg: Message) {
  log.info('StarterBot', msg.toString())

  const talker = msg.talker()
  const room = msg.room()

    if (msg.self() === false){
      log.info('NotMe')

      if(msg.text() === '/start'){
          await msg.say('Ready to send message.')

        MegSwitch = true
      }
      else if(msg.text() === '/stop'){
          await msg.say('Stop to send message.')

        MegSwitch = false
      }
      else if(msg.text() === '/change'){
        await msg.say('Type the end string in Chinese.')

        ChangingEndString = true
      }
      else if(msg.text() === '/debugon'){
        await msg.say('Debug on. The bot is effective for everyone.')
        DebugSwitch = true
      }
      else if(msg.text() === '/debugoff'){
        await msg.say('Debug off. The bot is effective for the rooms & talkers you set.')
        DebugSwitch = false
      }
      else if(msg.text() === '/setrange'){
        SetRangeSwitch = true
        AfterSelectSetRange(msg)
      }
      else if(SetRangeSwitch && msg.text() === '/addtalker'){
        CurrentSetRangeType = 0
        await msg.say('Enter the name of the talker.')

      }
      else if(SetRangeSwitch && msg.text() === '/addroom'){
        CurrentSetRangeType = 1
        await msg.say('Enter the topic of the room.')
      }
      else if(SetRangeSwitch && msg.text() === '/deltalker'){
        CurrentSetRangeType = 2
        ListRange(msg)
        await msg.say('Enter the number of the talker that you want to delete.')
      }
      else if(SetRangeSwitch && msg.text() === '/delroom'){
        CurrentSetRangeType = 3
        ListRange(msg)
        await msg.say('Enter the number of the room that you want to delete.')
      }
      else if(SetRangeSwitch && CurrentSetRangeType === -1){
        SetRangeSwitch = false
        await msg.say('Quit setting mode.')
      }
      else if(msg.text() === '/status'){
        if(MegSwitch == true){
          await msg.say('Status = On')
        }
        else{
          await msg.say('Status = Off')
        }

        if(DebugSwitch == true){
          await msg.say('Debug = On')
        }
        else{
          await msg.say('Debug = Off')
        }

        await msg.say('End String = ' + EndString)

        ListRange(msg)
      }
      else if(msg.text() === '/help'){
        await msg.say('RepeatBot - A good bot to bother anyone you like!\n\nCommands:\n/start - Start the bot.\n/stop - Stop the bot.\n/change - Change the end string.\n/status - Get the status of the bot.\n/debugon - Enter the debug mode.\n/debugoff - Exit the debug mode.\n/setrange - Set the rooms & talkers that the bot can send messages to.')
      }
      else if(ChangingEndString === true){
        EndString = msg.text()
        ChangingEndString = false
        await msg.say('Change successfully!')
      }
      else{
        if(SetRangeSwitch){
          switch(CurrentSetRangeType){
            case 0:
              talkerlist.push(msg.text())
              msg.say('Add talker ' + msg.text() + ' successfully!')
              break
            case 1:
              roomlist.push(msg.text())
              msg.say('Add room ' + msg.text() + ' successfully!')
              break
            case 2:
              var delindex = parseInt(msg.text())
              if(delindex>=0 && delindex<talkerlist.length){
                talkerlist.splice(delindex, 1)
                msg.say('Delete talker successfully!')
              }
              else{
                msg.say('Input error!')
              }
              break
            case 3:
              var delindex = parseInt(msg.text())
              if(delindex>=0 && delindex<roomlist.length){
                roomlist.splice(delindex, 1)
                msg.say('Delete room successfully!')
              }
              else{
                msg.say('Input error!')
              }
              break
            default:
              break
          }
          CurrentSetRangeType = -1
          AfterSelectSetRange(msg)
        }
        else if(MegSwitch === true){
          var SendSwitch = false

          if(DebugSwitch){
            SendSwitch = true
          }
          else{
            if(room){
              const topic = await room.topic()
              for(var i=0;i<roomlist.length;i++){
                  if(topic.search(roomlist[i])!=-1){
                    SendSwitch = true
                    console.log('In the room')
                    break       
                }
              }
            }
            else if(talker){
              for(var i=0;i<talkerlist.length;i++){
                if(talker.name() == talkerlist[i]){
                  SendSwitch = true
                  console.log('In the talker')
                  break
                }
              }
            }
          }


          if(SendSwitch === true){
            var result = ''

            if(msg.type() === bot.Message.Type.Text&&msg.text()!=='[Send an emoji, view it on mobile]'){

              var text = msg.text()
              var tmpindex
              const quotestr = '<br/>- - - - - - - - - - - - - - -<br/>'

              // Quote
              if((tmpindex = text.search(quotestr))!=-1){
                text=text.substring(tmpindex+quotestr.length,text.length-1)
              }

              // End with punctuation
              tmpindex = text.length-1
              while(tmpindex>-1&&(text[tmpindex]=='?'||text[tmpindex]=='？'||text[tmpindex]=='!'||text[tmpindex]=='！'||text[tmpindex]=='.'||text[tmpindex]=='。'||text[tmpindex]==','||text[tmpindex]=='，')){
                text=text.substring(0,text.length-1)
                tmpindex--
              }

              var words = nodejieba.tag(text)
              console.log(words)
              
              var vindex = new Array()
              var nindex = new Array()

              for(var i=words.length-1;i>=0;i--){
                if(words[i].tag === 'v' || words[i].tag === 'vd' || words[i].tag === 'vn'){
                    vindex.push(i)
                }
                else if(words[i].tag === 'n' || words[i].tag === 'nr' || words[i].tag === 'ns' || words[i].tag === 'nt' || words[i].tag === 'nz'){
                    nindex.push(i)
                }
              }

              if(vindex.length!==0){
                result=words[vindex[0]].word

                if(result.length==1){
                  if(vindex.length>1&&vindex[0]-vindex[1]==1){
                    result=words[vindex[1]].word+result
                  }
                  else if(vindex[0]+1<words.length){
                    result+=words[vindex[0]+1].word
                  }
                }
              }
              else if(nindex.length!==0){
                result=words[nindex[0]].word
              }
              else{
                result=text
              }
            }

            await msg.say(result+EndString)
          }
        }
      }
    }
}

function AfterSelectSetRange(msg: Message){
  ListRange(msg)
  msg.say('/addtalker - Add a talker.\n/addroom - Add a room.\n/deltalker - Delete a talker.\n/delroom - Delete a room.\nAny other string - Finish setting.')
}


function ListRange(msg: Message){
  var talkerstring = ''
  var roomstring = ''

  if(CurrentSetRangeType==3){
    // nothing to do
  }
  else if(talkerlist.length === 0){
    talkerstring = 'Talkers:\nNULL'
  }
  else{
    talkerstring = 'Talkers:\n'
    for(var i=0;i<talkerlist.length-1;i++){
      if(CurrentSetRangeType==2){
        talkerstring += (i.toString() + ' - ')
      }
      talkerstring += (talkerlist[i]+'\n')
    }
    if(CurrentSetRangeType==2){
      talkerstring += ((talkerlist.length-1).toString() + ' - ')
    }
    talkerstring += talkerlist[talkerlist.length-1]
  }

  if(CurrentSetRangeType==2){
    // nothing to do
  }
  else if(roomlist.length === 0){
    roomstring = 'Rooms:\nNULL'
  }
  else{
    roomstring = 'Rooms:\n'
    for(var i=0;i<roomlist.length-1;i++){
      if(CurrentSetRangeType==3){
        roomstring += (i.toString() + ' - ')
      }
      roomstring += (roomlist[i]+'\n')
    }
    if(CurrentSetRangeType==3){
      roomstring += ((roomlist.length-1).toString() + ' - ')
    }
    roomstring += roomlist[roomlist.length-1]
  }

  if(CurrentSetRangeType==2){
    msg.say(talkerstring)
  }
  else if(CurrentSetRangeType==3){
    msg.say(roomstring)
  }
  else{
    msg.say(talkerstring + '\n\n' + roomstring)
  }
}

const bot = new Wechaty({
  name: 'ding-dong-bot',
})

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))
