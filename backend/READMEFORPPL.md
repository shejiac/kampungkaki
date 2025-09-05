first i need you to have your postgres ready i dont know how you planning to acess it but yea 

FILL IN YOUR .ENV FILE WITH YOUR POSTGRES DETAILS
IMPORT ALL IMPT STUFF 
    "npm install"

SET UP DATABASE AND TABLES 
go to backend/scripts/dbSetup.ts and run 
   "npx ts-node backend/scripts/dbSetup.ts"

FILL IN USER TABLE 
then go to backend/test/mockUsers.ts and run
    "npx ts-node backend/test/mockUsers.ts" 

FILL IN REQUEST TABLE (CAN DO IF U WANT NOT NECESSARY I THINK)
then go to backend/test/mockRequests.ts and run
    "npx ts-node backend/test/mockRequests.ts"

NOW YOUR DB IS POPULATED WITH SOME INFO 

go to backend/src/helpers/pwd to use relevant functions 