# LoS DESKTOP

## Prerequisites

Before installing this application, please ensure you have PostgreSQL installed on your system.

### Installing PostgreSQL

1. Download PostgreSQL from the official website: https://www.postgresql.org/download/
2. Run the installer and follow the prompts.
3. During installation, note down the password you set for the postgres user.
4. Choose to install all components when prompted, including "Command Line Tools".

### Setting up PATH

After installation, you need to add PostgreSQL to your system's PATH:

1. Search for "Environment Variables" in the Start menu and open it.
<img src="./images/path_setting1.png" alt="Search Environment Variables" width="300">
2. Under "System variables", find and select the "Path" variable, then click "Edit".
<img src="./images/path_setting2.png" alt="Edit Path Variable" width="300">
3. Click "New" and add the path to your PostgreSQL bin directory. It's typically:
   `C:\Program Files\PostgreSQL\{version}\bin`
   Replace {version} with your installed version (e.g., 13, 14, 15).
<img src="./images/path_setting3.png" alt="Add Path" width="300">
4. Click "OK" to close all dialogs.