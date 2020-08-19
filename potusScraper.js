const axios = require('axios');
const cheerio = require('cheerio');
const download = require('image-downloader');
const http = 'https://wallpaperscraft.ru';
const urlList = [
    `${http}/catalog/nature`,
    `${http}/catalog/city`,
    `${http}/catalog/flowers`,
];

//choose page for download
const getLinksWithPage = urlList.map(url => {
    return new Promise((resolve, reject) => {
        axios.get(url)
            .then(function (response) {
                const $ = cheerio.load(response.data);
                const maxPage = +($('.pager__item.pager__item_last-page .pager__link').attr('href').split('/')[3].split('page')[1]);
                const newPage = Math.floor(Math.random() * maxPage + 1);
                resolve(`${url}/page${newPage}`);
            })
            .catch(function (error) {
                reject(error)
            });
    });
});

//choose picture from page
Promise.all(getLinksWithPage)
    .then(urlList => {
        const getLinksOfPictures = urlList.map(url => {
            return new Promise((resolve, reject) => {
                axios.get(url)
                    .then(response => {
                        const $ = cheerio.load(response.data);
                        const countOfPicture = $('.wallpapers__image').length;
                        const numberOfPicture = Math.floor(Math.random() * countOfPicture);
                        const path = $($('.wallpapers__item .wallpapers__link')[numberOfPicture]).attr('href').replace('wallpaper', 'download');
                        resolve(`${http}${path}/1600x1200`);
                    })
                    .catch(error => {
                        reject(error)
                    })
            });
        });

        //on the page of picture search the button for download and get a link from this
        Promise.all(getLinksOfPictures)
            .then(urlList => {
                const getLinksForDownload = urlList.map(url => {
                    return new Promise((resolve) => {
                        axios.get(url)
                            .then(response => {
                                const $ = cheerio.load(response.data);
                                const button = $('.gui-toolbar.gui-toolbar_stretch.gui-subheading .gui-toolbar__item.gui-hidden-mobile .gui-button.gui-button_full-height').attr('href');
                                resolve(button);
                            })
                            .catch(error => {
                                resolve(undefined)
                            })
                    });
                });

                //download image
                Promise.all(getLinksForDownload)
                    .then(urlList => {
                        urlList.forEach(url => {
                            if (url === undefined) {
                                console.log('STATUS CODE 404');
                            } else {
                                const options = {
                                    url: url,
                                    dest: './images'
                                }
                                download.image(options)
                                    .then(({ filename }) => {
                                        console.log('Saved to', filename)
                                    })
                                    .catch((err) =>
                                        console.error(err)
                                    )
                            }
                        });
                    });
            });
    });