download postgres
download DBEAVER
complete all fields it prompts you with "postgres"
make a file .env
FILL IN YOUR .ENV FILE WITH YOUR POSTGRES DETAILS
    DB_USER="postgres"
    DB_HOST="localhost"
    DB_NAME="postgres"
    DB_PASSWORD="postgres"
    DB_PORT="5432"

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

go to backend/src/helpers/volunteer/getAllRequestDetails.ts or backend/src/helpers/chat/mainHelperFunctions.ts to use relevant functions 

to use the function, import {functionname} from relativepathfromfileyouwanttousein