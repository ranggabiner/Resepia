This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Semantic Guideline

### Types

- `feat` — new feature for the user
- `fix` — bug fix for the user
- `docs` — documentation changes
- `style` — formatting, missing semi colons, etc.
- `refactor` — refactoring production code
- `test` — adding missing tests, refactoring tests
- `chore` — updating grunt tasks, nothing that an external user would see

<br>

## Branch Names

### Format

```
<name>/<type>/<task_description>
```

### Example

```
john/docs/setup-instructions
john-smith/feat/user-authentication
```

<br>

## Commit Messages

### Format

```
<type>(<optional scope>): <description>
```

### Example

```
feat: add login page
fix(button): logout user
```

<br>

## Pull Requests (Title)

### Format

```
<type>(<optional scope>): <brief description>
```

### Example

```
feat: add user authentication
fix(api): resolve 404 error on user fetch
docs: update README with setup instructions
```

<br>

## Pull Requests (Description)

### Format

```
## Summary
A brief description of the changes made.

## Changes Made
* Bullet point list of changes made

## Screenshots (if applicable)
Include screenshots of the changes in action, if applicable.
```

### Example

```
## Summary
Added user authentication feature to allow users to securely log in and access their accounts.

## Changes Made
* Created login and registration forms
* Integrated authentication API
* Added JWT token handling
* Updated navigation to reflect authentication state

## Screenshots (if applicable)
```
