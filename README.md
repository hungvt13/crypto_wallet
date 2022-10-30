## Hung Tran

This app stimulate a crypto wallet with real time conversion to USD

### Installing

1. Please make sure you have installed nodejs 14+

If not you can download it here [https://nodejs.org/en/]

2. Clone the folder from the repo

3. Download the [CSV file](https://s3-ap-southeast-1.amazonaws.com/static.propine.com/transactions.csv.zip)

4. Put the csv file into `./src/data` , make sure the file is in correct place

5. Using the CLI tool, move to the folder directory

6. run `npm install`

7. create an `.env` file and copy paste the content from `env.local`

### Commands

Start caching and populate data:
Note: After this data for that specific file will be cached
If you change to another file, must run this command again

```
npm run-script init
```

Get current portfolio with all tokens:

```
npm run script run
```

Optional params `token=` & `date=`
Get portfolio of given time and with target token group

```
npm run-script run token=BTC,ETH date=10/23/2019
```

Optional params `token=` & `date=`
Get portfolio of given time and with target token group

Get portfolio by read full file even if there's cached data

```
npm run-script run token=BTC,ETH date=10/23/2019 --no-cache
```

### Assumptions

#### Top level

The assumptions I made on what is the overall app use for

- App is used by one single person for one for single data input
- App is like a batch runner, start and stop when finished
    => does not need to focus intensively on non-blocking handling
- Is run in a safe environment where protection from intruders are not needed
- Use in U.S region
    => use date format as MM/dd/yyyy
- User would input with the correct format into the CLI
- Will run with only .csv files

#### Low level

##### External API

- The external data for fetching conversions will always be available and return correct data

##### CSV

- CSV file would mostly be in correct format, no 2 bytes words, dates will be sorted descending, no corrupted data, TOKEN names will be in correct format
- data numerical values is in safe range of JS
- there will only be two types of transaction: DEPOSIT & WITHDRAW

#### Technical decisions

##### CLI

"init"

- to perform run though the file and creating a "fake" cache then store as json for faster performance

"token"

- I allowed the user to have multiple tokens input separated by a comma so more tokens can be displayed on portfolio - storing as an array.

"date"

- Single date with format of MM/dd/yyyy

##### Folder structure

- configs - store all the app configs
- cache - cache files
- logs - logs files
- data - where the app will read data from
- services - all the services needed to support the app
- domain - store the business logics separately
- utils - help with handling data manipulations

##### Portfolio with file

Since each line is a record of single transaction
A full read is needed in order to sum the balance
Summing up line by line of the file

If getting the portfolio without cache and with params
I made a logic that compare the date, taking end of date of the input and convert it into epoch, then start skipping the dates bigger than it
For the tokens, the lines not matching will also be skipped

```js
// skip data that not matched criteria
if (targetTokens?.length && !targetTokens.includes(token)) return false;
if (targetDate && targetDate < parseInt(date)) return false;
```

a small check for data integrity also there

```js
if (!validateDate(parseInt(date)))
  throw new Error(`line #${lineCount}: CSV date is incorrect`);
if (!validateType(Object.values(TRANSACTION_TYPE), transactionType))
  throw new Error(`line #${lineCount}: CSV transaction_type is incorrect`);
if (!validateTokenName(token))
  throw new Error(`line #${lineCount}: CSV token is incorrect`);
if (!validateTokenAmount(amount))
  throw new Error(`line #${lineCount}: CSV amount is incorrect`);
```

result will return and portfolio object like this

```
{
  BTC: 120.033344,
  ETH: 1.133333
}
```

##### Portfolio with cache

logic can be found in `./src/services/cache-helper.js`
Basic idea:
Store the balance of X day(s) into a JSON file for faster and smaller read
Only the date present in the file will be recorded

```
{
  "date": balance
}
```

the keys are denote by the epoch date
when user have params date, it will try to find it in the case

1. if the date is larger than the latest date found, use the latest balance
2. if the date is older than the first date found, return empty balance since it should be 0 ( no transactions yet )
3. If the date the in between but does not have record, logic will decrease the date down until there's a match - since there is no transactions, balance will be the same

Though the number of day can be adjusted, right now the searching logic is only supporting 1 day
Still I feel like it is much faster: around 5s average comparing to full read of 50s
In order for this feature to run, user needs to run this command first

```
npm run-script init
```

##### External API

Axios is used as a library to fetch data since it is really useful with error handling - which can be extended for the app later

##### file

Usage of readFileStream for better asynchronous performance and non-blocking advantages of Nodejs

```
function createReadStreamSafe (filename, options) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filename, options)
    fileStream
      .on('error', reject)
      .on('open', () => {
        resolve(fileStream)
      })
  })
}
```
