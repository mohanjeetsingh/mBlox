/*!
 * mBlox for Blogger
 * Demo @ https://mBloxForBlogger.blogspot.com/
 * Agency @ https://CIA.RealHappinessCenter.com
 * Copyright (c) 2025, Mohanjeet Singh (https://Mohanjeet.blogspot.com/)
 * Released under the MIT license
 */
function mBlocks(m) {
    $(m).map(function () {
        /* SETTINGS PULLED FROM USER PLACEMENT + VALIDATION + DEFAULT SETTINGS APPLICATION */
        const
            element = $(this),
            dataLabel = element.attr("data-label") || "Label Name missing",
            contentType = (element.attr("data-contentType") || "recent").toLowerCase(),// should be comments/label/recent
            siteURL = element.attr("data-feed") || "/",//blogspot site url - default or custom
            dataTitle = element.attr("data-title") || "",
            dataDescription = element.attr("data-description") || "",
            dataType = (element.attr("data-type") || "v-ih").toLowerCase(),
            blockType = dataType.substring(0, 1),//block type
            componentList = dataType.substring(1),
            dataTheme = (element.attr("data-theme") || "light").toLowerCase(),// [light, dark, primary,secondary] 
            containsHeader = (-1 != componentList.search("h")),
            containsImage = componentList.includes("i"),
            containsSnippet = componentList.includes("s"),
            containsAuthor = componentList.includes("a"),
            containsDate = componentList.includes("d"),
            sectionHeight = element.attr("data-iHeight") || (blockType == "v" ? "100vh" : (blockType == "s" ? "70vh" : "m")),
            articleHeight = sectionHeight == 'm' ? '' : "height:" + sectionHeight + "!important;",
            stageID = element.attr("data-s") || 1,//stage - code defined
            firstInstance = (element.attr("data-s") === undefined),//first instance - code defined
            postsPerBlock = parseInt(element.attr("data-posts") || 3),
            mBlockID = element.closest(".widget-content").parent(".widget").attr("ID") || (dataTitle + dataType + dataLabel);
        let
            blurImage = (element.attr("data-iBlur") == "true") ? true : (element.attr("data-iBlur") == "false" ? false : (containsHeader && (-1 == $.inArray(blockType, ["s", "l", "t", "p", "q"])))), //(default - true for non-image-only objects),
            columnCount = element.attr("data-cols"),//
            blockRows = parseInt(element.attr("data-rows") || 1),//
            isCarousel = (element.attr("data-isCarousel") || "").toLowerCase() == "true",
            containsNavigation = false,
            contentWrapper = "",
            feedURL = siteURL + "feeds/",
            carouselIndicators = '';//carousel indicators

        //console.log(el);
        //           console.log({tit,l,cor,thm,tva});
        //console.log({tit,mID,isL,cuSt});
        //console.log({bTy,isH,isI,isS,isC});
        //console.log({tit,isCa,isH,isS,isI,isCTA,isMo,isB});

        //FEED SETTING
        switch (contentType) {
            case "recent": feedURL += "posts"; containsImage ? (feedURL += "/default") : (feedURL += "/summary"); break;
            case "comments": feedURL += "comments"; containsImage ? (feedURL += "/default") : (feedURL += "/summary"); break;
            default: feedURL += "posts"; containsImage ? (feedURL += "/default") : (feedURL += "/summary"); feedURL += "/-/" + dataLabel;
        }
        feedURL += "?alt=json-in-script&start-index=" + ((stageID - 1) * postsPerBlock + 1) + "&max-results=" + postsPerBlock;
        //console.log({tit,f,l,isI});

        //JSON PULL
        $.ajax({
            url: feedURL,
            type: "get",
            dataType: "jsonp",
            success: function (response) {
                if (response.feed.entry) {
                    const postsInFeed = response.feed.entry.length,//Total number of actual posts in feed
                        totalPostsAvailable = response.feed.openSearch$totalResults.$t,
                        snippetSize = element.attr("data-snippetSize") || 150,
                        cornerStyle = ((element.attr("data-corner") || "").toLowerCase() == "sharp") ? " rounded-0" : " rounded",
                        textVerticalAlign = (element.attr("data-textVAlign") || (blockType == 'v' ? "middle" : (blockType == 'l' ? "bottom" : 'overlay'))).toLowerCase(),
                        inverseTheme = (dataTheme == "light" ? "primary" : "light"),//theme inverse
                        aspectRatio = " ratio ratio-" + (element.attr("data-ar") || "1x1").toLowerCase(),// [1x1,4x3,3x4,16:9,9:16,21:9,9:21]
                        bsGutter = element.attr("data-gutter") || ((blockType == "v") ? 0 : 3),
                        isImageFixed = (element.attr("data-iFix") || "").toLowerCase() == "true",
                        lowContrast = (element.attr("data-lowContrast") || "").toLowerCase() == "true",
                        hasRoundedBorder = (element.attr("data-iBorder") || "").toLowerCase() == "true",
                        callToAction = element.attr("data-CTAText") || "",
                        isComplexLayout = (blockType == "l" || blockType == "s"),
                        totalStages = Math.ceil(totalPostsAvailable / postsPerBlock);//total stages
                    let blockBody = '',//block body
                    moreText = element.attr("data-moreText") || "",
                    finalType = blockType;
                    //console.log(fe.feed.entry);
                    //console.log(fe.feed.link);
                    //console.log({tit,b,fe,toRe,nuSt});

                    (postsPerBlock <= 1 || blockType == "l") && (isCarousel = false);
                    (contentType == "comments") && (moreText="");
                    
                    let windowInnerWidth = 0;
                    if (isCarousel || containsImage) { windowInnerWidth = window.innerWidth; }

                    //Image Resolution Setting
                    let imageResolution = 100;
                    if (containsImage && !blurImage) {
                        if (isImageFixed) { imageResolution = windowInnerWidth; } else {
                            switch (columnCount) {
                                case 1: imageResolution = windowInnerWidth;
                                case 2: windowInnerWidth < 768 ? imageResolution = windowInnerWidth : imageResolution = windowInnerWidth / 2;
                                case 3: windowInnerWidth < 768 ? imageResolution = windowInnerWidth : (windowInnerWidth < 992 ? imageResolution = windowInnerWidth / 2 : imageResolution = windowInnerWidth / 3);
                                case 4: windowInnerWidth < 576 ? imageResolution = windowInnerWidth : (windowInnerWidth < 768 ? imageResolution = windowInnerWidth / 2 : (windowInnerWidth < 992 ? imageResolution = windowInnerWidth / 3 : imageResolution = windowInnerWidth / 4));
                                case 5: windowInnerWidth < 576 ? imageResolution = windowInnerWidth / 2 : (windowInnerWidth < 768 ? imageResolution = windowInnerWidth / 3 : (windowInnerWidth < 1200 ? imageResolution = windowInnerWidth / 4 : imageResolution = windowInnerWidth / 5));
                                case 6: windowInnerWidth < 576 ? imageResolution = windowInnerWidth / 3 : (windowInnerWidth < 992 ? imageResolution = windowInnerWidth / 4 : (windowInnerWidth < 1200 ? imageResolution = windowInnerWidth / 5 : imageResolution = windowInnerWidth / 6));
                            }
                        }
                        imageResolution = Math.ceil(imageResolution / 100) * 100;
                    }

                    if (firstInstance) {
                        element.attr("data-s", stageID);

                        //BLOCK HEADER - TITLE & DESCRIPTION
                        (dataTitle != "") && element.append('<div class="text-center m-0 bg-' + dataTheme + ' py-5"><h4 class="display-5 fw-bold text-' + inverseTheme + ' py-3 m-0 ' + (lowContrast ? "opacity-50" : "") + '">' + dataTitle + '</h4>' + ((dataDescription != "") ? ('<span class="pb-3 text-black-50">' + dataDescription + '</span>') : '') + '</div>');
                    }

                    if (typeof (columnCount) === "undefined") {
                        switch (blockType) {
                            case "v":case "m": case "t": columnCount = 1; break;
                            case "p": columnCount = 3; break;
                            case "c": case "q": columnCount = 4; break;
                            case "g": columnCount = 5; break;
                            case "l": columnCount = 2; break;
                            case "s": columnCount = 6; break;
                        }
                    } else { columnCount = parseInt(columnCount); (columnCount < 1) && (columnCount = 1); (columnCount > 6) && (columnCount = 6); }

                    //CAROUSEL COLUMNS ADJUSTMENT TO WINDOW SIZE
                    if (isCarousel) {
                        let actualColumnCount = 0;

                        if (windowInnerWidth < 576) { columnCount < 5 ? actualColumnCount = 1 : (columnCount == 5 ? actualColumnCount = 2 : actualColumnCount = 3); }
                        else if (windowInnerWidth < 768) { columnCount < 4 ? actualColumnCount = 1 : (columnCount == 4 ? actualColumnCount = 2 : (columnCount == 5 ? actualColumnCount = 3 : actualColumnCount = 4)); }
                        else if (windowInnerWidth < 992) { columnCount == 3 ? actualColumnCount = 2 : (columnCount == 4 ? actualColumnCount = 3 : actualColumnCount = 4); }
                        else if (windowInnerWidth < 1200) { (columnCount > 4) && (columnCount == 5 ? actualColumnCount = 4 : actualColumnCount = 5); }
                        else { actualColumnCount = columnCount; }
                        //console.log({tit,iW,bC,aC});

                        (blockRows > Math.ceil(postsInFeed / columnCount)) && (blockRows = Math.ceil(postsInFeed / columnCount));
                        (postsInFeed <= (actualColumnCount * blockRows)) && (isCarousel = false, containsNavigation = true);
                    }
                    //CAROUSEL OPEN
                    if (isCarousel) {
                        carouselIndicators = document.createElement("div");
                        $(carouselIndicators).addClass('carousel-indicators');
                        (blockType != "v") && ($(carouselIndicators).addClass('position-relative m-0'));
                    }
                    (isCarousel || containsNavigation) && (blockBody += '<div class="carousel-inner">');

                    //console.log({tit,bC,aC,bP,bR,l,toRe,isCa,isNav});

                    //BLOCK BODY WRAPPER
                    contentWrapper = document.createElement('div');
                    contentWrapper.id = 'm' + mBlockID;
                    const mBlockCode = $(contentWrapper);
                    mBlockCode.appendTo(element).attr({ "data-bs-ride": "carousel" });
                    contentWrapper.className = ('overflow-hidden bg-' + dataTheme + (blockType == "s" ? ' sFeature' : "") + ((isCarousel || containsNavigation) ? (' st' + stageID + ' carousel carousel-fade') : ""));
                    //console.log({tit,l,b,bP,bC});
                    //console.log(fe.feed.entry);

                    //FEED LOOP FOR POSTS
                    for (let postID = 0; postID < postsInFeed; postID++) {
                        const post = response.feed.entry[postID],
                            postTitle = post.title.$t,
                            postSnippet = (containsSnippet || containsImage) && (("content" in post) ? post.content.$t : (("summary" in post) ? (post.summary.$t) : (("summary" in b_rc) ? (post.summary.$t) : "")));
                        let postAuthor = post.author[0].name.$t, snippetText="", snippetCode = "";
                        console.log({postTitle,postSnippet,dataTitle});
                        //console.log({tit,p,fTy,bTy,fC,bC});

                        //LIST
                        (blockType == "l") && postID > 0 && (containsHeader ? (finalType = "t", columnCount--) : finalType = "c");

                        //<< POST COMPONENT LIBRARY >>
                        //AUTHOR INFO
                        let authorCode = '',authorURL="";
                        if (containsAuthor) {
                            contentType != "comments" && ((postAuthor == "Anonymous" || postAuthor == "Unknown") ? (authorURL = siteURL) : (authorURL = post.author[0].uri.$t));

                            //COMMENT AUTHOR
                            switch (finalType) {
                                case "q": authorCode += '<figcaption class="small fw-lighter">- ' + postAuthor + '</figcaption>'; break;
                                case "m": authorCode += '<span class="small text-'+dataTheme+'" rel="author">' + postAuthor + '</span>'; break;
                            }
                        }
                        
                        //DATE
                        let dateCode = '';
                        if (containsDate) {
                            const o = post.published.$t,
                                //                      c=o.substring(0,4),
                                //                    m=o.substring(5,7),
                                //                  h=o.substring(8,10),
                                //                u=month_format[parseInt(m,10)]+" "+h+", "+c,
                        
                                h = (post.published.$t, post.content.$t, post.published.$t);
                          //  console.log(h);
                            let v = h.split("T");
                            dateCode = " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][(v = v[0].split("-"))[1] - 1] + " " + v[2] + ", " + v[0];
                            dateCode = '<span class="small fw-lighter">'+(containsAuthor?' &#8226; ':'') + dateCode + '</span>';
                            // console.log(d);
                        }

                        //TITLE - DISPLAY AND NORMAL
                        let displayHeaderCode = "", normalHeaderCode = "", commentHeaderCode = "";
                        (finalType == "q") ? (normalHeaderCode = '<svg class="float-start link-primary" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-quote" viewBox="0 0 16 16"><path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/></svg><blockquote class="blockquote link-primary text-start mt-2 ms-4">' + postTitle + '</blockquote>') : (containsHeader && (displayHeaderCode = '<h3 class="display-5 mx-lg-5 ' + (lowContrast ? "opacity-50" : "opacity-75") + '">' + postTitle + '</h3>', normalHeaderCode = '<h5 class="card-title fw-normal">' + postTitle + '</h5>',commentHeaderCode='<span class="d-block my-2">"' + postTitle+'"</span>'));

                        //SNIPPET
                        if (containsSnippet) {
                            (snippetText = postSnippet.replace(/<\S[^>]*>/g, "")).length > 70 && (snippetText = snippetText.substring(0, snippetSize) + "...");
                            //console.log({ tit: T, it, c, z });
                            snippetCode = '<summary class="list-unstyled' +
                                (dataTheme == "light" ? ' text-muted' : ' opacity-75')+
                                (finalType == "v" ? ' py-3 d-block mx-lg-5' : '') +
                                (lowContrast ? ' opacity-75' : '') +
                                '">' + snippetText + '</summary>';
                        }

                        //LINK
                        let postURL = "";
                        for (let z = 0; z < post.link.length; z++) if ("alternate" == post.link[z].rel) { postURL = post.link[z].href; break; }
                        //                        console.log({tit},it.link[z].rel,it.link.length);

                        //IMAGE SETTINGS
                        let imageCode ="", videoThumbnailURL = "", showcaseImageCode = "";
                        if (containsImage) {
                            let imageURL = noImg, highResImageURL = noImg;
                            let contentParser = $("<div>").html(postSnippet);
                            //console.log({iU,iH,c});
                            if (contentType == 'comments') {
                                imageURL = post.author[0].gd$image.src;
                                imageURL.match("blogblog.com") && (imageURL = noImg);
                            }
                            else {
                                //console.log({tit,c},c.indexOf("//www.youtube.com/embed/"));
                                if (postSnippet.indexOf("//www.youtube.com/embed/") > -1) {
                                    videoThumbnailURL = post.media$thumbnail.url;//v-mThumb	
                                    //console.log({tit,iV});
                                    (-1 !== videoThumbnailURL.indexOf("img.youtube.com")) && (videoThumbnailURL = videoThumbnailURL.replace("/default.jpg", "/maxresdefault.jpg"));
                                }
                                if (postSnippet.indexOf("<img") > -1) {
                                    imageURL = contentParser.find("img:first").attr("src");
                                    (-1 !== imageURL.indexOf("/s72-c")) ? (highResImageURL = imageURL.replace("/s72-c", "/s1600")) : ((-1 !== imageURL.indexOf("/w640-h424")) ? highResImageURL = imageURL.replace("/w640-h424", "/s1600") : (highResImageURL = imageURL));
                                    (-1 !== highResImageURL.indexOf("/s1600")) && (imageURL = highResImageURL.replace("/s1600", "/s" + imageResolution));
                                    //console.log({s,iH,iU});
                                }
                            }
                            (videoThumbnailURL == "") && (videoThumbnailURL = imageURL);
                            //console.log({bTy,fTy,ty,p,iU,iH});

                            let imageCoverStyle = " object-fit:cover;height:100%!important;",
                                imageBSClass = ' w-100 img-fluid',
                                fixedImageStyle = ' background:url(' + highResImageURL + ') fixed center center;background-size:cover;',
                                tooltipAttributes = "";
                            switch (finalType) {
                                case "p": imageBSClass = aspectRatio; break;
                                case "m":imageCoverStyle += ' height:3rem!important;width:3rem;';
                                fixedImageStyle += ' height:3rem!important;width:3rem;';
                                imageBSClass = ' rounded-circle m-2'; break;
                                case "q":
                                    imageCoverStyle += ' height:6rem!important;width:6rem;';
                                    fixedImageStyle += ' height:6rem!important;width:6rem;';
                                    imageBSClass = ' rounded-circle mx-auto mt-3'; break;
                                case "t": imageBSClass = " col-4 h-100"; break;
                                case "s":
                                    let videoID = (-1 !== videoThumbnailURL.indexOf("img.youtube.com")) ? (videoThumbnailURL.substr(videoThumbnailURL.indexOf("/vi/") + 4, 11)) : "regular";
                                    postID == 0 && (tooltipAttributes = '" data-toggle="tooltip" data-vidid="' + videoID + '"', showcaseImageCode = '<figure class="m-0' + imageBSClass +(cornerStyle == " rounded" ? ' rounded-5 rounded-bottom' : cornerStyle) + '" style="' + fixedImageStyle + articleHeight + '" role="img" loading="lazy" title="' + postTitle + '" aria-label="' + postTitle + ' image"' + tooltipAttributes + '></figure>');
                                    imageBSClass += aspectRatio+' shadow-sm';
                                    break;
                                case "v": fixedImageStyle += articleHeight; break;
                            }
                            blurImage && !(contentType == "comments") && (imageBSClass += ' blur-5');

                            imageCode = isImageFixed ? ('<figure class="m-0' + imageBSClass + '" style="' + fixedImageStyle + '" role="img" loading="lazy" aria-label="' + postTitle + ' image"' + tooltipAttributes + '></figure>') : ('<img class="' + imageBSClass + '" style="' + imageCoverStyle + '" src="' + imageURL + '" alt="' + postTitle + ' image" loading="lazy" title="' + postTitle + '" ' + tooltipAttributes + '/>');
                            //console.log({imS});
                        }//IMAGE SETTINGS

                        //CTA BUTTON (purely visual therefore button instead of a)
                        let ctaButtonCode = "";
                        if (callToAction != "") {
                            switch (finalType) {
                                case "g": break;
                                case "m": ctaButtonCode = '<span class="link-'+dataTheme+' small">'+callToAction+'</span>' ; break;
                                default:
                                    ctaButtonCode = '<button class="btn ' +
                                        ((cornerStyle != " rounded" || finalType == "p" || finalType == "q") ? 'rounded-0' : '') +
                                        (lowContrast ? " opacity-50" : " opacity-75");
                                    switch (finalType) {
                                        case "s": ctaButtonCode += " p-3 px-lg-5 float-end"; break;
                                        case "v": ctaButtonCode += ' p-2 px-4  mx-lg-5 mt-4'; break;
                                        case "p": case "q": ctaButtonCode += ' py-2 px-3 w-100 text-end link-' + inverseTheme; break;
                                        case "t": ctaButtonCode += ' mt-3'; break;
                                        case "c": case "l": ctaButtonCode += ' bottom-0 end-0 me-3 mb-3 d-block position-absolute w-auto'; break;
                                    }
                                    ctaButtonCode += ' border-0 btn-' + dataTheme + '" role="button" title="' + postTitle + '">' + callToAction + '</button>';
                            }
                        }

                        //CAROUSEL INDICATORS
                        isCarousel && (postID % (actualColumnCount * blockRows) == 0) && ($(carouselIndicators).append('<button type="button" data-bs-target="#m' + mBlockID + '" data-bs-slide-to="' + postID / (actualColumnCount * blockRows) + '" class="bg-' + inverseTheme + (postID == 0 ? (' active" aria-current="true"') : '"') + ' aria-label="Slide ' + (postID / (actualColumnCount * blockRows) + 1) + '"></button>'));

                        //SHOWCASE
                        finalType == "s" && firstInstance && postID == 0 && mBlockCode.before('<div class="feature-image card border-0 text-center bg-' + dataTheme + ' overflow-hidden rounded-0"><div class="sIframe" style="display:none;"></div>' + showcaseImageCode + '<a class="link-' + inverseTheme + '" href="' + postURL + '" title="' + postTitle + '">' + ((containsHeader) ? ('<div class="sContent card-img-overlay rounded-0 ' + (cornerStyle == " rounded" && "rounded-top") + ' mx-md-5 p-3 px-lg-5 bg-' + dataTheme + ' mt-auto" style="height:fit-content;">' + normalHeaderCode + ' ' + snippetCode + '</div>') : "") + ((containsImage || callToAction != "") ? ctaButtonCode : "") + '</a></div>');

                        //WRAPPER - CAROUSEL & CONTENT
                        if (postID == 0 || (isCarousel && postID % (actualColumnCount * blockRows) == 0) || (blockType == "l" && postID == 1)) {
                            blockBody += '<div class="row  g-' + bsGutter + ' mx-0';
                            isCarousel && ((blockBody += ' carousel-item'), (postID == 0) && (blockBody += ' active'));
                            //isCa && console.log({ tit, bTy, fTy, p, b });
                            isComplexLayout && (blockType == "l") && (blockBody += ' col flex-grow-1');
                            (finalType != "v") && (!(isComplexLayout && (finalType == "t" || finalType == "c")) && (blockBody += ' pb-' + bsGutter), (isCarousel || containsNavigation) && (blockBody += ' px-2 px-sm-3 px-md-4 px-lg-5'));
                            switch (columnCount) {
                                case 1: blockBody += ' row-cols-1">'; break;
                                case 2: blockBody += ' row-cols-1 row-cols-sm-1 row-cols-md-2">'; break;
                                case 3: blockBody += ' row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-3">'; break;
                                case 4: blockBody += ' row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-4">'; break;
                                case 5: blockBody += ' row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-4 row-cols-xl-5">'; break;
                                case 6: blockBody += ' row-cols-3 row-cols-sm-4 row-cols-md-4 row-cols-lg-5 row-cols-xl-6">'; break;
                            }
                        }
                        //console.log({tit,p,b});

                        //ARTICLE START
                        blockBody += '<article class="col d-inline-flex' + (finalType == "s" ? (' sPost" data-title="' + postTitle + '" data-link="' + postURL + '" data-summary="' + snippetText + '" data-vidid="' + videoID + '" data-img="' + videoThumbnailURL + '" data-toggle="tooltip"') : (finalType == "v" ?'" style='+articleHeight+'"':'"')) + ' role="article">';

                        //LINK START
                        finalType != "s" && (blockBody += '<a class="overflow-hidden w-100 shadow-sm' +
                        (finalType != "v" ? cornerStyle : ' rounded-0') +
                        (finalType != "m" ? ' card' : ' text-bg-'+inverseTheme) +
                        (hasRoundedBorder ? (' border border-3 border-opacity-75 border-' + dataTheme) : ' border-0') +
                            ((finalType == "q" || finalType == "v") ? ' text-center h-100' : ((finalType == "t"||finalType=="m") ? " row g-0" : ((finalType == "l" || finalType == "c" || finalType == "g") ? aspectRatio + (finalType == "l" ? ' mt-' + bsGutter : '') : ""))) + '" href="' + postURL + '" title="' + postTitle + '">');

                        //IMAGE
                        containsImage && (blockBody += imageCode);

                        //TEXT
                        if (containsHeader && finalType != "s" && finalType != "g") {
                            switch (finalType) {
                                case "m": blockBody+= '<div class="col p-2 ps-0">'; break;
                                    case "t": containsImage && (blockBody += '<div class="col-8 h-100">');
                                    case "p": case "q": blockBody += '<div class="card-body' + (dataTheme != "light" && (finalType == "p" || (blockType == "l" && finalType == "t")) ? (' h-100 bg-opacity-75 text-bg-' + dataTheme) : ' text-'+ inverseTheme) + '">';
                                        break;
                                    case "l": blockBody += '<div class="text-bg-' + dataTheme + ' bg-opacity-75 rounded-0 ps-5 py-3" style="height:fit-content;">Latest</div>';
                                    case "c": blockBody += '<div class="text-bg-' + dataTheme + ' bg-opacity-75 rounded-0 p-5';
                                        switch (textVerticalAlign) {
                                            case "top": blockBody += ' h-auto">'; break;
                                            case "middle": blockBody += ' h-auto top-50 translate-middle-y">'; break;
                                            case "bottom": blockBody += ' h-auto bottom-0" style="top:auto;">'; break;
                                            case "overlay": blockBody += '">'; break;
                                        }
                                        break;
                                    case "v": finalType == "v" && (blockBody += '<div class="text-bg-' + dataTheme + ' bg-opacity-75 p-4 p-sm-5 position-absolute w-75 ' + ((cornerStyle == " rounded" && textVerticalAlign != "overlay") ? ' rounded-5' : cornerStyle) + ' start-50 translate-middle');
                                        switch (textVerticalAlign) {
                                            case "top": blockBody += '-x mt-5">'; break;
                                            case "middle": blockBody += ' top-50">'; break;
                                            case "bottom": blockBody += '-x  bottom-0 mb-5">'; break;
                                            case "overlay": blockBody += ' top-50 h-100 w-100">'; break;
                                        }
                                }

                                blockBody += authorCode+dateCode;
                                (finalType == "v") ? blockBody += displayHeaderCode : (finalType=='m') ? blockBody+=commentHeaderCode : blockBody += normalHeaderCode;
                                blockBody += snippetCode;
                                !(finalType == "p" || finalType == "q") && (blockBody += ctaButtonCode);//CTA 

                                blockBody += '</div>';
                                finalType == "t" && containsImage && (blockBody += '</div>');
                                (finalType == "p" || finalType == "q") && (blockBody += ctaButtonCode);//CTA - card footer type
                            }//TEXT
                        finalType != "s" && (blockBody += '</a>');
                        blockBody += '</article>';

                        (postID == (postsInFeed - 1) || (isCarousel && (postID % (actualColumnCount * blockRows) == (actualColumnCount * blockRows - 1)))) && (blockBody += '</div>');
                        //isCa&&console.log({tit,p,b});
                    }//feed

                    if (isCarousel || containsNavigation) {
                        blockBody += '</div>';

                        //CAROUSEL NAVIGATION AND WRAPPER CLOSURE
                        let previousButtonCode ="", nextButtonCode = "";
                        previousButtonCode = '<button class="carousel-control-prev link-secondary' + (containsNavigation ? " nav-prev" : " pb-5") + '" type="button" title="Click for Previous" data-bs-target="#m' + mBlockID + '" data-bs-slide="prev" style="width:5%;"><svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-left-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"></path></svg><span class="visually-hidden">Previous</span></button>', nextButtonCode = '<button class="carousel-control-next link-secondary' + (containsNavigation ? " nav-next" : " pb-5") + '" title="Click for Next" type="button" data-bs-target="#m' + mBlockID + '" data-bs-slide="next" style="width:5%;"><svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-right-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg><span class="visually-hidden">Next</span></button>';
                        blockBody += isCarousel ? (previousButtonCode + nextButtonCode) : "";
                        mBlockCode.append(blockBody);
                        mBlockCode.append(carouselIndicators);
                        containsNavigation && ((stageID > 1) && mBlockCode.append(previousButtonCode), (stageID < totalStages) && mBlockCode.append(nextButtonCode));
                    } else { mBlockCode.append(blockBody); }

                    //BLOCK FOOTER - JUMP-LINK
                    //console.log((!(!isMo && bTy=='v')),ty);
                    let footerNavCode = "";
                    (!(moreText == "" && blockType == 'v')) && (footerNavCode += '<nav aria-label="Page navigation" class="st' + stageID + ' w-100 pe-5 py-5 pagination justify-content-end bg-' + dataTheme + '">');
                    if (moreText != "") {
                        for (i = 0; i < response.feed.link.length; i++) {
                            let feedURL = response.feed.link[i];
                            if ("alternate" == feedURL.rel) {
                                let moreLinkURL = feedURL.href;
                                //console.log(tit,r,r.href,r.rel);
                                footerNavCode += '<a class="text-bg-' + dataTheme + ' border-0 ' + (lowContrast ? "opacity-50" : "opacity-75") + '" href="' + moreLinkURL + '?&max-results=12" title="Click for More">' + moreText + ' <svg class="bi bi-caret-right-fill" fill="currentColor" height="1em" viewBox="0 0 16 16" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg></a>';
                            }
                        }
                    }
                    (!(moreText == "" && blockType == 'v')) && (footerNavCode += '</nav>');
                    mBlockCode.after(footerNavCode);
                }//if
                else {
                    switch (contentType) {
                        case "recent": element.append('<div class="text-center text-bg-'+dataTheme+' display-6 p-4 w-100">Sorry! No recent updates.</div>'); break;
                        case "comments": element.append('<div class="text-center text-bg-'+dataTheme+' display-6 p-4 w-100">No comments. <br/> Start the conversation!</div>'); break;
                        default: element.append('<div class="text-center text-bg-'+dataTheme+' display-6 p-4 w-100">Sorry! No content found for "' + dataLabel + '"!</div>');
                    }
                } //console.log(b);
            },//success
            complete: function () {
                //NAV
                if (containsNavigation) {
                    element.find(".nav-prev").unbind('click').click(function () {
                        const currentStage = (element.attr("data-s"));
                        element.attr("data-s", +currentStage - 1);
                        //console.log(s-2);
                        //console.log(el);
                        //console.log(el.attr("data-s"));
                        element.find(".st" + currentStage).fadeOut(); element.find(".st" + (currentStage - 1)).fadeIn();
                    });
                    element.find(".nav-next").unbind('click').click(function () {
                        const currentStage = (element.attr("data-s"));
                        element.find(".st" + currentStage).fadeOut();
                        //console.log(e.find(".st" +s).length==0);
                        element.attr("data-s", +currentStage + 1);
                        //console.log({ m, s: sC, t }, t == 0);
                        (element.find(".st" + (+currentStage + 1)).length == 0) ? mBlocks(element) : element.find(".st" + (+currentStage + 1)).fadeIn();
                    });
                }//if
                //SHOWCASE
                if (blockType == "s") {
                    const featuredImageNode = element.find(".feature-image");
                    const figureNode = featuredImageNode.find("figure"), iFrameNode = featuredImageNode.find(".sIframe"), contentNode = featuredImageNode.find(".sContent");
                    figureNode.click(function () {
                        let clickedVideoID = $(this).attr("data-vidid");
                        if (clickedVideoID !== "regular") {
                            iFrameNode.html('<iframe src="https://www.youtube.com/embed/' + clickedVideoID + '?autoplay=1" allowfullscreen="" style="' + articleHeight + 'width:100%;" frameborder="0"></iframe>'), iFrameNode.fadeIn(0), figureNode.fadeOut(0),contentNode.fadeOut(0);
                        }
                    }),
                        element.find(".sPost").map(function () {
                            $(this).click(function () {
                                const videoID = $(this).attr("data-vidid"),
                                    postTitle = $(this).attr("data-title");
                                let playIcon = figureNode.find("svg")||false;
                                if (videoID.toLowerCase() != "regular") {
                                    videoTitle = "Click here to load the video!";
                                    (playIcon.length==0)?figureNode.append('<svg class="position-absolute top-50 translate-middle" xmlns="http://www.w3.org/2000/svg" width="75" height="75" fill="#f00" class="bi bi-youtube" viewBox="0 0 16 16"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/></svg>'):playIcon.fadeIn(0);
                                } else { videoTitle = postTitle; playIcon.fadeOut(0); }
//                                console.log(fi);
                                figureNode.attr({ style: "background:url(" + $(this).attr("data-img") + ") center center;background-size:cover;" + articleHeight, "data-vidid": videoID, title: videoTitle, "aria-label": videoTitle });
                                iFrameNode.fadeOut(0), figureNode.fadeIn(0),
                                    contentNode.fadeIn(0), contentNode.find("h5").html(postTitle), contentNode.find("summary").html($(this).attr("data-summary")),
                                    featuredImageNode.find("a").attr({ href: $(this).attr("data-link"), title: postTitle }), featuredImageNode.find("button").attr("title", postTitle);
                                })
                        })
                }
                //(isCa)&&console.log(b);
                //console.log(b);
            }//complete
        })//ajax
    });//map
}