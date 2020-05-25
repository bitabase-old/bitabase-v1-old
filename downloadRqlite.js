const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const righto = require('righto');
const chalk = require('chalk');
const unzipper = require('unzipper');
const tar = require('tar');
const { http, https } = require('follow-redirects');
const callarest = require('callarest/json');
const { extractTarballDownload, extractZipDownload } = require('calladownload-extract');

const url = 'https://api.github.com/repos/rqlite/rqlite/releases/latest';

function extract (downloadUrl, downloadDestination, extractPath, options, callback) {
  if (downloadDestination.endsWith('.zip')) {
    extractZipDownload(downloadUrl, downloadDestination, extractPath, options, callback)
  } else {
    extractTarballDownload(downloadUrl, downloadDestination, extractPath, options, callback)
  }
}

function download (options, callback) {
  const releases = righto(callarest, {
    url,
    headers: {
      'User-Agent': 'nodejs'
    }
  });

  let downloadUrl
  if (options.assetLookup === 'win') {
    downloadUrl = 'https://ci.appveyor.com/api/projects/otoolep/rqlite/artifacts/rqlite-latest-win64.zip?branch=master'
  } else {
    const release = releases.get(rest => {
      console.log(rest)
      return rest.body.assets.find(asset => asset.name.includes(options.assetLookup));
    });

    downloadUrl = release.get('browser_download_url');
  }

  const downloadDestination = options.downloadFilePath;
  const extractPath = options.extractPath;

  const extractionResult = righto(extract,
    downloadUrl,
    downloadDestination,
    extractPath, {
      headers: {
        'User-Agent': 'nodejs'
      },
      httpAgent: http,
      httpsAgent: https
    }
  );

  extractionResult(callback);
}

function getFilesInTarball (file, callback) {
  const downloadDestination = file;
  const entries = [];
  tar.t({ file: downloadDestination, onentry: i => entries.push(i.path) }, function (error) {
    if (error) {
      return callback(error);
    }
    callback(null, entries);
  });
}

function getBinPath (options, callback) {
  fs.readdir(options.extractPath, function (error, files) {
    if (error) {
      return callback(error);
    }
    const rqliteBin = files.filter(file => file.endsWith('rqlited') || file.endsWith('rqlited.exe'));
    if (!rqliteBin[0]) {
      return callback(new Error('rqlited was not found in tarball'));
    }
    callback(null, path.join(options.extractPath, rqliteBin[0]));
  })
}

function main (options, callback) {
  console.log('downloading', options)

  options = options || {};
  options.downloadFilePath = options.downloadFilePath;
  options.extractPath = options.extractPath;

  download(options, function (error, result) {
    if (error) {
      return callback(error);
    }
    getBinPath(options, callback)
  });
}

main({
  assetLookup: 'win',
  downloadFilePath: './dist/rqlite-win.zip',
  extractPath: './dist/rqlite-win'
}, console.log)

main({
  assetLookup: 'darwin',
  downloadFilePath: './dist/rqlite-darwin.tar.gz',
  extractPath: './dist/rqlite-darwin'
}, console.log)

main({
  assetLookup: 'linux',
  downloadFilePath: './dist/rqlite-linux.tar.gz',
  extractPath: './dist/rqlite-linux'
}, console.log)
