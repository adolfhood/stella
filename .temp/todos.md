To-dos:
App Functionality:
- Make it look like an app
- Merge /m pages with / pages so that it is the same just differ in UI (use CSS)
- Fix issue with signing out not reloading data
- Add a tutorial
- Improve desktop UI
- Add email confirmation
- Add reset password functionality
- Add animations
- Make functionalities consistent
- Use different color themes for each sub app (blue for reminders, green for money, black for journal, red for rewards)

Tasks Functionality:
- Add tagged display
- Make the calendar picker consistent (Merge the due date and time on add task modal)
- Add warning when deleting types that is used on time logs
- Make the add/edit task "repeat" a separate modal or drawer

Money Manager:
- Create context ✅
- Add daily view ✅
- Create moneycard component ✅
- Add calendar view ✅
    - Calendar view ✅
    - Make non-month days darker
    - Add drawer view when day is clicked
- Add monthly view
    - Monthly view ✅
    - Add drawer view when week is clicked
- Add total view (budget view)
- Budget functionality
- Add add/edit modal
    - Income, Expense or Transfer selector ✅
    - Date time picker ✅
    - Repeat and Installment
    - Categories
    - Amount (with calculator)
    - Note ✅
    - Description ✅
    - Change add/edit fields when transaction is selected
- Add stats view
    - Pie Chart, Bar Chart
    - Income view
    - Expense view
    - Daily, Weekly, Monthly, Annually and Period selection
- Accounts view
    - Assets
    - Liabilities
    - Total
- Add search with filter
- Add top selector
- Add income, expense, total header

- Create migrations (daily_transactions)


type: income | expense | transfer
date: date
account: account_id
category: category_id
amount: number
note: string
description: string
transferConfig: {
    from: account_id
    to: category_id
}
repeatConfig: null | {
    value: everyday | weekdays | weekend | every week | every 2 weeks | every 4 weeks | every 4 weeks | every month | end of the month | every 2 months | every 3 months | every 4 months | every 6 months | annually
}
installmentConfig: null | {
    value: number
}

incomes_expenses
id: uuid
type: string
date: datetime
account: uuid
category: uuid
amount: number
note: string
description: string
repeatConfig: null | jsonb
installmentConfig: null | jsonb

accounts (STATIC)
id: uuid
name: string
amount: number
description: string

categories
id: uuid
name: string
amount: number
description: string

Rewards System
- Rewards as spin
- Rewards as buying
- Points as currency
- Goal setting functionality (if goal reached, get points)
- Optional point deduction when goal not reached

Journal System
- Mood
- Templating
- Find template for journal
- Keep it short

Firebase:
- Enable billing
- Create pubsub equivalent to discord bot call
- Use firebase messaging for notifications
- Make a session context

Deployment:
- Buy a domain name

Polishing:
- Make everything easy
- Make it rewarding
- Make it visible (notifications)
- Make it attractive (supernormal stimuli, temptation bundling, creating a community, frame productivity in a positive light)

Optional:
- Make it modular like odoo
- Create a discord server
- Create articles for SEO