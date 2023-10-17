const {createAuthorizationHeader} = require("ondc-crypto-sdk-nodejs")
const signMessage = require("ondc-crypto-sdk-nodejs/lib/utility/index").signMessage
const express=  require("express")
const { default: axios } = require("axios")
const cors = require("cors")
require("dotenv").config()
const app = express()
app.use(cors())
const PORT = process.env.PORT, PRIVATE_KEY = process.env.PRIVATE_KEY, UNIQUE_KEY = process.env.UNIQUE_KEY, BAPID = process.env.BAPID, GATEWAY_URL = process.env.GATEWAY_URL
app.use(express.json())




async function generateHeader(message){
 const result =  await createAuthorizationHeader({
    message: message,
    privateKey: PRIVATE_KEY , //SIGNING private key
    bapId: BAPID , // Subscriber ID that you get after registering to ONDC Network
    bapUniqueKeyId: UNIQUE_KEY, // Unique Key Id or uKid that you get after registering to ONDC Network
  })
  
  return result
    
}

app.post('/createHeader',async (req,res)=>{
  const response = await generateHeader(req.body)
res.setHeader("Authorization",response)
res.setHeader("Access-Control-Expose-Headers","*")
  return res.send({payload:req.body})
})

app.post("/search",async(req,res)=>{
  const timestamp = new Date()
  req.body.context.timestamp = timestamp
  const header = await generateHeader(req.body)
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: GATEWAY_URL+'search',
    headers: { 
      'Authorization': header,
      'Content-Type': 'application/json'
    },
    data : JSON.stringify(req.body)
  };
  
  axios.request(config)
  .then((response) => {
    res.json(response.data)
  })
  .catch((error) => {
    console.log(error);
  });
  
})


app.listen(PORT,()=>{
  console.log("server running at "+PORT)
})






