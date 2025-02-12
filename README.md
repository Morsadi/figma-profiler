# Figma Profiler

Figma Profiler is a tool designed to streamline the process of managing design assets and variables within Figma. This README provides a step-by-step guide to setting up and running the Figma Profiler application.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/Morsadi/figma-profiler.git
    cd figma-profiler
    ```

2. Install dependencies using npm:

    ```bash
    npm install
    ```

## Configuration

1. Create a `.env` file in the root directory of the project.
2. Add the following environment variables to the `.env` file:

    ```bash
    ACCESS_TOKEN=
    FILE_KEY=
    CLIENTS_FOLDER_PATH=
    ```

    - Find Access Token in https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens
    - File Key is 22ch and can be found in the Figma page link you're working on https://app.screencast.com/dNwI6IFqYZON7

## Starting the Application

To start the Figma Profiler application, run the following command:

```bash
npm run dev
