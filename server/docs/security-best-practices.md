# Security Best Practices for GreenList

## Handling Sensitive Information

### Environment Variables

- **NEVER commit `.env` files to version control**
- Always use `.env.example` files with placeholder values
- Make sure `.env` is included in `.gitignore`

### API Keys and Secrets

- Store all API keys and secrets in environment variables
- Rotate API keys periodically (every 30-90 days)
- Use different API keys for development and production environments

## What to Do If Credentials Are Exposed

If you accidentally commit sensitive information to Git:

1. **Immediately revoke and rotate the exposed credentials**

   - For SendGrid: Create a new API key and delete the old one
   - For MongoDB: Rotate database passwords
   - For JWT: Change your JWT secret

2. **Remove the sensitive information from Git history**

   ```bash
   # Install BFG Repo-Cleaner (a faster alternative to git-filter-branch)
   # Download from: https://rtyley.github.io/bfg-repo-cleaner/

   # Create a backup of your repository
   cp -r your-repo your-repo-backup

   # Create a text file with the sensitive information to remove
   echo "SENDGRID_API_KEY=your_actual_api_key" > sensitive-data.txt

   # Run BFG to remove the sensitive data
   java -jar bfg.jar --replace-text sensitive-data.txt your-repo

   # Change directory to your repository
   cd your-repo

   # Clean up and verify the sensitive data is gone
   git reflog expire --expire=now --all && git gc --prune=now --aggressive

   # Force push the changes to remote repository
   git push --force
   ```

3. **Notify relevant parties**
   - Inform your team about the exposure
   - If required by your organization, report the incident to security team

## Preventing Future Exposures

1. **Use pre-commit hooks**

   - Install tools like `git-secrets` or `detect-secrets` to prevent committing sensitive information

2. **Implement code reviews**

   - Always have another team member review code before merging to main branches

3. **Use secret scanning tools**

   - GitHub offers secret scanning for private repositories
   - Consider tools like GitGuardian for additional protection

4. **Education and awareness**
   - Train all team members on secure coding practices
   - Regularly review security protocols

## Additional Resources

- [GitHub Documentation on Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [SendGrid Security Best Practices](https://sendgrid.com/blog/category/security/)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
