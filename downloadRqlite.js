const fs = require('fs');
const path = require('path');

const righto = require('righto');
const { http, https } = require('follow-redirects');
const callarest = require('callarest/json');
const { extractTarballDownload, extractZipDownload } = require('calladownload-extract');

const url = 'https://api.github.com/repos/rqlite/rqlite/releases/latest';

function extract (downloadUrl, downloadDestination, extractPath, options, callback) {
  if (downloadDestination.endsWith('.zip')) {
    extractZipDownload(downloadUrl, downloadDestination, extractPath, options, callback);
  } else {
    extractTarballDownload(downloadUrl, downloadDestination, extractPath, options, callback);
  }
}

function download (options, callback) {
  const releases = righto(callarest, {
    url,
    headers: {
      'User-Agent': 'nodejs',
      Authorization: process.env.GITHUB_TOKEN ? 'token ' + process.env.GITHUB_TOKEN : null
    }
  });

  let downloadUrl;
  if (options.assetLookup === 'win') {
    downloadUrl = 'https://ci.appveyor.com/api/projects/otoolep/rqlite/artifacts/rqlite-latest-win64.zip?branch=master';
  } else {
    const release = releases.get(rest => {
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
  });
}

function main (options, callback) {
  console.log('downloading', options);

  options = options || {};

  download(options, function (error, result) {
    if (error) {
      return callback(error);
    }
    getBinPath(options, callback);
  });
}

if (process.argv[2] !== '--linux-only') {
  main({
    assetLookup: 'win',
    downloadFilePath: './dist/rqlite-win.zip',
    extractPath: './dist/rqlite-win'
  }, console.log);

  main({
    assetLookup: 'darwin',
    downloadFilePath: './dist/rqlite-darwin.tar.gz',
    extractPath: './dist/rqlite-darwin'
  }, console.log);
}

main({
  assetLookup: 'linux',
  downloadFilePath: './dist/rqlite-linux.tar.gz',
  extractPath: './dist/rqlite-linux'
}, console.log);
