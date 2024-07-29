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
    CLIENT_NAME=
    ACCESS_TOKEN=
    FILE_KEY=
    CLIENTS_FOLDER_PATH=
    ```

    Example

    ```bash
    CLIENT_NAME=amarillo-redesign
    ACCESS_TOKEN=figd_6Pwt0P3Xe9_l3A8p4_Gmd3DmjotN3Vrptc_BTgDf
    FILE_KEY=eG9oxCYlvvYWDraiQUzalz
    CLIENTS_FOLDER_PATH=C:\cms30\nodeServer\clients\
    ```

## Starting the Application

To start the Figma Profiler application, run the following command:

```bash
npm run dev
