# GitHub Wiki Setup Instructions

This directory contains all the markdown files for the Cloud-Native E-commerce Platform GitHub Wiki. Follow these instructions to set up the wiki.

## Setting Up the GitHub Wiki

1. **Enable the Wiki feature in your GitHub repository**:
   - Go to your GitHub repository
   - Click on "Settings"
   - Scroll down to "Features" section
   - Make sure "Wikis" is checked/enabled

2. **Clone the wiki repository**:

   ```bash
   # Clone the wiki repository (separate from the main repo)
   git clone https://github.com/sloweyyy/cloud-native-ecommerce-platform.wiki.git
   cd cloud-native-ecommerce-platform.wiki
   ```

3. **Copy the wiki files**:

   ```bash
   # Copy all markdown files from the wiki directory to the wiki repository
   cp -r /path/to/cloud-native-ecommerce-platform/wiki/*.md .
   ```

4. **Rename Home.md**:

   ```bash
   # Ensure Home.md exists (GitHub wiki uses this as the landing page)
   # If it doesn't exist, rename one of your files to Home.md
   ```

5. **Commit and push to the wiki**:

   ```bash
   git add .
   git commit -m "docs: add comprehensive wiki documentation"
   git push origin master
   ```

6. **Verify the wiki**:
   - Go to your GitHub repository
   - Click on the "Wiki" tab
   - You should see all your wiki pages properly formatted and linked

## Wiki Structure

The wiki consists of the following pages:

- **Home**: Overview and main navigation
- **Architecture**: System architecture and design patterns
- **Microservices**: Details about each microservice
- **Deployment**: Deployment guides and infrastructure setup
- **Development**: Development setup and coding standards
- **API Documentation**: API endpoints and usage
- **Monitoring**: Observability and monitoring setup
- **Contributing**: How to contribute to the project
- **Troubleshooting**: Common issues and solutions

## Maintaining the Wiki

For future updates to the wiki:

1. Clone the wiki repository if you haven't already
2. Make your changes
3. Commit and push directly to the wiki repository

Alternatively, you can edit the wiki directly through the GitHub web interface.

## Images and Assets

For images referenced in the wiki:

1. Upload them to the wiki repository
2. Reference them in markdown using relative paths
3. Or use the GitHub web interface to upload images when editing wiki pages

## Additional Resources

- [GitHub Wiki Documentation](https://docs.github.com/en/communities/documenting-your-project-with-wikis)
- [Markdown Syntax Guide](https://www.markdownguide.org/basic-syntax/)
