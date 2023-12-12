# Phantasma Blocks

Phantasma Blocks is a A dynamic transactional engine optimized for consistent, high-frequency operations. Designed to process 10 transactions per minute, Phantasma-Blocks offers a seamless blend of speed and reliability, ensuring that every transaction, like a phantom, moves swiftly and effortlessly through the digital realm.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [Software or tool name] - [Version] (e.g., Node.js v14+)

## Setup and Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/phantasma-io/Phantasma-Blocks.git
   cd Phantasma-Blocks
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Configuration**:

   - Rename `.env.mainnet` to `.env` (if applicable)
   - Edit `.env` to include your settings and save the file.

4. **Build the Project** (if applicable):
   ```bash
   npm run build
   ```

## Running the Application

1. Start the application:

   ```bash
   npm start
   ```

## Configuring the Run Blockz Service

To configure the `Run Blockz` service to work with your setup, you will need to modify the `ExecStart` path in the existing service file. This ensures that the service correctly points to the `autostart.sh` script in your repository. Follow these steps:

1. **Locate the Service File**: Find the `runblockz.service` file. This is typically located in the `/etc/systemd/system/` directory.

2. **Edit the Service File**: Open the `runblockz.service` file in a text editor with administrative privileges. You can use editors like `nano` or `vim`. For instance:

   ```
   sudo nano /etc/systemd/system/runblockz.service
   ```

3. **Modify the ExecStart Path**: In the service file, locate the `ExecStart` line. Change the path to point to your `autostart.sh` script within the cloned repository. For example:

   ```ini
   ExecStart=sh /path/to/your/repo/autostart.sh
   ```

   Replace `/path/to/your/repo/` with the actual path where your repository is located.

4. **Save the Changes**: After making the changes, save the file and exit the editor. For `nano`, you can do this by pressing `CTRL+X`, then `Y` to confirm, and `Enter` to save.

5. **Reload Systemd**: To apply the changes, reload the systemd configuration:

   ```
   sudo systemctl daemon-reload
   ```

6. **Restart the Service**: Restart the `Run Blockz` service to apply the new configuration:

   ```
   sudo systemctl restart runblockz.service
   ```

7. **Verify the Service**: Ensure that the service is running with the new settings:

   ```
   sudo systemctl status runblockz.service
   ```

8. **Check Logs for Debugging**: If needed, you can check the service logs for any issues:
   ```
   journalctl -u runblockz.service
   ```

By following these steps, you will have successfully configured the `Run Blockz` service to use the `autostart.sh` script from your repository. This ensures that the service will behave as expected with your setup.

## Customizing the Autostart Script for NPM or Bun

If you're using `npm` or `bun` in your `Run Blockz` service, it's important to ensure that the `autostart.sh` script points to the correct executable paths. This involves updating the `PATH` variable within the script to include the directories where `npm` or `bun` are located. Here's how to do it:

1. **Locate the Autostart Script**: Find the `autostart.sh` script within your cloned repository.

2. **Edit the Autostart Script**: Open `autostart.sh` in a text editor. You might need administrative rights to modify this file.

3. **Update the PATH Variable**: Look for a commented `PATH` variable line in the script:

   ```bash
   #PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
   ```

   Uncomment and modify this line to include the paths to `npm` or `bun`. For instance, if `npm` is located in `/usr/local/bin/npm` and `bun` in `/usr/local/bin/bun`, ensure these paths are included:

   ```bash
   PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
   ```

   If you're unsure of where `npm` or `bun` are installed, you can use `which npm` or `which bun` in your terminal to find out.

4. **Save and Close the File**: After adjusting the `PATH`, save your changes and close the editor.

5. **Make the Script Executable**: Confirm that the `autostart.sh` script is executable:

   ```
   chmod +x /path/to/your/repo/autostart.sh
   ```

6. **Restart the Service**: Apply the changes by restarting the `Run Blockz` service:

   ```
   sudo systemctl restart runblockz.service
   ```

7. **Check the Service Status**: Verify that the service is functioning correctly with the new script configuration:

   ```
   sudo systemctl status runblockz.service
   ```

By customizing the `PATH` in the `autostart.sh` script, you ensure that the correct versions of `npm` or `bun` are used by the `Run Blockz` service. This step is crucial for the proper operation of your application.

## Contributing

If you want to contribute to Phantasma Blocks, see the [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the [License Name] License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

If you want to contact the maintainers, you can reach out at [info@phantasma.io].
