const axios = require('axios');
const cheerio = require('cheerio');
const download = require('image-downloader');
const http = 'https://wallpaperscraft.ru';
const url = [
    `${http}/catalog/nature`,
    `${http}/catalog/city`,
    `${http}/catalog/flowers`
];

const getLinksWithPage = url.map(url => {
    return new Promise((resolve, reject) => {
        axios.get(url)
            .then(function (response) {
                const $ = cheerio.load(response.data);
                const maxPage = +($('.pager__item.pager__item_last-page .pager__link').attr('href').split('/')[3].split('page')[1]);
                const newPage = Math.floor(Math.random() * maxPage + 1);
                resolve(`${url}/page${newPage}`)
            })
            .catch(function (error) {
                reject(error)
            })
    })
});

Promise.all(getLinksWithPage)
    .then(url => {
        const getLinksOfPictures = url.map(url => {
            return new Promise((resolve, reject) => {
                axios.get(url)
                    .then(response => {
                        const $ = cheerio.load(response.data);
                        const countOfPicture = $('.wallpapers__image').length;
                        const numberOfPicture = Math.floor(Math.random() * countOfPicture + 1);
                        const path = $($('.wallpapers__item .wallpapers__link')[numberOfPicture]).attr('href').replace('wallpaper', 'download');
                        resolve(`${http}${path}/1600x1200`);
                    })
                    .catch(error => {
                        reject(error)
                    })
            })
        });

        Promise.all(getLinksOfPictures)
            .then(url => {
                const getLinksForDownload = url.map(url => {
                    return new Promise((resolve, reject) => {
                        axios.get(url)
                            .then(response => {
                                const $ = cheerio.load(response.data);
                                const button = $('.gui-toolbar.gui-toolbar_stretch.gui-subheading .gui-toolbar__item.gui-hidden-mobile .gui-button.gui-button_full-height').attr('href');
                                resolve(button)
                            })
                            .catch(error =>
                                reject(error)
                            )
                    })
                });

                Promise.all(getLinksForDownload)
                    .then(url => {
                        url.forEach(url => {
                            const options = {
                                url: url,
                                dest: 'down/study/parser/images'
                            }
                            download.image(options)
                                .then(({ filename }) => {
                                    console.log('Saved to', filename)
                                })
                                .catch((err) =>
                                    console.error(err)
                                )
                        })
                    })
            });
    });