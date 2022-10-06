/*!
 * mBlocks for Blogger
 * CIA.RealHappinessCenter.com
 * Copyright (c) 2022, Mohanjeet Singh
 * Released under the MIT license
 */
function mBlocks(m) {
    $(m).map(function () {
        /* SETTINGS PULLED FROM USER PLACEMENT + VALIDATION + DEFAULT SETTINGS APPLICATION */
        const el = $(this),//-e
            la = el.attr("data-label") || "Label name missing",//e-a
            l = el.attr("data-feed") || "https://mohanjeet.blogspot.com";//blogspot site url - default or custom
           let cor = (el.attr("data-corner") || "round").toLowerCase(),
            tva = (el.attr("data-textVAlign") || "bottom").toLowerCase(),
            thm = (el.attr("data-theme") || "light").toLowerCase(),// [light, dark, primary] 
            ar = (el.attr("data-ar") || "1x1").toLowerCase(),// [1x1,4x3,3x4,16:9,9:16,21:9,9:21]
            bH = el.attr("data-iHeight"),//
            isB = el.attr("data-iBlur"), //(default - true for non-image-only objects),
            isF = (el.attr("data-iFix") || "x").toLowerCase() == "true",
            isL = (el.attr("data-lowContrast") || "x").toLowerCase() == "true",
            isR = (el.attr("data-iBorder") || "x").toLowerCase() == "true",
            ty = (el.attr("data-type") || "c-ih").toLowerCase(),
            coTy = (el.attr("data-contentType") || "recent").toLowerCase(), // should be comments/label/recent
            bP = parseInt(el.attr("data-posts") || 3),
            bC = el.attr("data-cols"),//
            bR = parseInt(el.attr("data-rows") || 1),//
            mo = el.attr("data-moreText"),//default - More text not shown
            cta = el.attr("data-CTAText"),//default - CTA not shown
            tit = el.attr("data-title") || "",
            des = el.attr("data-description") || "",
            snS = el.attr("data-snippetSize") || 150,
            isCa = (el.attr("data-isCarousel") || "x").toLowerCase() == "true",
            //CODE-DEFINED VARIABLES
            iThm = "light",//theme inverse
            isNav = false,
            cuSt = el.attr("data-s"),//code defined (default=1)
            preSt = 0,
            b = '',//-s, block body
            cI = '',//carousel indicators
            bTy = 'v',//block type
            mID = el.closest(".widget-content").parent(".widget").attr("ID");


        //SETTINGS - BLOCK TYPE, HEADER, SNIPPET, AUTHOR NAME AND IMAGE | CTA, CAROUSEL, BLUR, GUTTER
        bTy = ty.substring(0, 1);
        var t = ty.substring(1);
        const isH = (-1 != t.search("h")),
            isI = (-1 != t.search("i")),
            isS = (-1 != t.search("s")),
            isA = (-1 != t.search("a")),
            isCTA = (typeof (cta) !== "undefined"),
            isMo = (typeof (mo) !== "undefined"),
            bG = el.attr("data-gutter") || ((bTy == "v") ? 0 : 3);

        (bP <= 1) && (isCa = false);
        isB = (isB == "true") ? true : (isB == "false" ? false : (isH && !(bTy == "s" || bTy == "l" || bTy == "t" || bTy == "p" || bTy == "q")));

        (cor == "sharp") ? (cor = "rounded-0") : (cor = "");
        (typeof (mID) === "undefined") && (mID = tit + ty + la);
        (typeof (cuSt) === "undefined") ? (cuSt = 1, preSt = 0) : (preSt = 1);
        (thm == "light") && (iThm = "primary");
        (preSt == 0) && el.attr("data-s", cuSt);

        //console.log(el);
        //           console.log({tit,l,cor,thm,tva});
        //console.log({tit,mID,isL,cuSt});
        //console.log({bTy,isH,isI,isS,isC});
        //console.log({tit,isCa,isH,isS,isI,isCTA,isMo,isB});

        //FEED SETTING
        let f = l + "/feeds/";
        switch (coTy) {
            case "recent": f += "posts"; isI ? (f += "/default") : (f += "/summary"); break;
            case "comments": f += "comments"; isI ? (f += "/default") : (f += "/summary"); break;
            default: f += "posts"; isI ? (f += "/default") : (f += "/summary"); f += "/-/" + la;
        }
        f += "?alt=json-in-script&start-index=" + ((cuSt - 1) * bP + 1) + "&max-results=" + bP;
        //console.log({tit,f,l,isI});
        let a1 = "";
        a1 = document.createElement('div');
        a1.id = 'm' + mID;
        $(a1).appendTo(el);

        //JSON PULL
        $.ajax({
            url: f,
            type: "get",
            dataType: "jsonp",
            success: function (fe) {
                toRe = fe.feed.openSearch$totalResults.$t;//-c
                //el.attr("data-totalResults",toRe);
                //                stIn=fe.feed.openSearch$startIndex.$t,//-f
                //                pePa=fe.feed.openSearch$itemsPerPage.$t;//-p
                //		  	var stCo=Math.ceil(toRe/pePa);//-m
                //console.log(fe.feed.entry);
                //console.log(fe.feed.link);
                var nuSt = Math.ceil(toRe / bP);
                //console.log({tit,b,fe,toRe,nuSt});

                if (fe.feed.entry) {
                    const l = fe.feed.entry.length;//Total number of actual posts in feed

                    //SETTINGS - COLUMNS, ROWS, NAV/CAROUSEL, iHEIGHT
                    if (typeof (bC) === "undefined") {
                        switch (bTy) {
                            case "v": bC = 1; break;
                            case "p": case "t": bC = 3; break;
                            case "c": case "q": bC = 4; break;
                            case "g": bC = 5; break;
                            case "l": bC = 2; break;
                            case "s": bC = 6; break;
                        }
                    } else { bC = parseInt(bC); (bC < 1) && (bC = 1); (bC > 6) && (bC = 6); }

                    let iW = "";
                    if (isCa || isI) { iW = window.innerWidth; }

                    //SETTING CAROUSEL COLUMNS ADJUSTMENT TO WINDOW LOAD SIZE
                    if (isCa) {
                        var aC = 0;
                        if (iW < 576) { bC < 5 ? aC = 1 : (bC == 5 ? aC = 2 : aC = 3); }
                        else if (iW < 768) { bC < 4 ? aC = 1 : (bC == 4 ? aC = 2 : (bC == 5 ? aC = 3 : aC = 4)); }
                        else if (iW < 992) { bC == 3 ? aC = 2 : (bC == 4 ? aC = 3 : aC = 4); }
                        else if (iW < 1200) { (bC > 4) && (bC == 5 ? aC = 4 : aC = 5); }
                        else { aC = bC; }
                        //console.log({tit,iW,bC,aC});
                    }

                    if (typeof (bH) === "undefined") {
                        switch (bTy) {
                            case "v": bH = "height:100vh!important;"; break;
                            case "s": bH = "height:70vh!important;"; break;
                            default: bH = ""
                        }
                    } else { bH = "height:" + bH + "!important;" }

                    (bR > Math.ceil(l / bC)) && (bR = Math.ceil(l / bC));
                    isCa && (l <= (aC * bR)) && (isCa = false, isNav = true);
//console.log({tit,bC,aC,bP,bR,l,toRe,isCa,isNav});

                    //BLOCK BODY - WRAPPER ATTRIBUTES
                    a1.className = ('overflow-hidden bg-' + thm + (bTy == "s" ? ' sFeature' : "") + ((isCa || isNav) ? (' st' + cuSt + ' carousel carousel-fade') : ""));
                    $(a1).attr({ "data-bs-ride": "carousel" });

                    //BLOCK HEADER - TITLE & DESCRIPTION
                    (tit != "" && preSt == 0) && $(a1).before('<div class="text-center m-0 bg-' + thm + ' py-5"><h4 class="display-6 text-' + iThm + ' py-3 m-0 ' + (isL ? "opacity-50" : "") + '">' + tit + '</h4>' + ((des != "") ? ('<span class="pb-3 text-black-50">' + des + '</span>') : '') + '</div>');

                    /*
                    b += '<div class="overflow-hidden bg-' + thm;
                    (bTy=="s")&&(b += ' sFeature');
                    (isCa||isNav)&&(b += ' st'+cuSt+' carousel carousel-fade" data-bs-ride="carousel" id="m' + mID);
                    b+='">'; 
                    */
                    //CAROUSEL OPEN
                    if (isCa) {
                        cI = document.createElement("div");
                        $(cI).addClass('carousel-indicators');
                        (bTy!="v")&&($(cI).addClass('position-relative m-0'));
                                            }
                    (isCa || isNav) && (b += '<div class="carousel-inner">');
                    //console.log({tit,l,b,bP,bC});
                    //console.log(fe.feed.entry);

                    let isC = false, fTy = bTy, fC = bC;
                    //FEED LOOP FOR POSTS
                    for (let p = 0; p < l; p++) {
                        let it = fe.feed.entry[p],
                            ti = it.title.$t,
                            au = it.author[0].name.$t,
                            sni = "";
                        //console.log({tit,it,ti,au});

                        //COMPLEX BLOCKS FEATURE DECLARATION
                        if (bTy == "l" || bTy == "s") {
                            isC = true;
                            let bF = "";
                            switch (bTy) { case "l": p > 0 && ((isH) ? (fTy = "t", fC = bC - 1) : fTy = "c"); }
                        }
                        //console.log({tit,p,fTy,bTy,fC,bC});

                        //<< POST COMPONENT LIBRARY >>
                        //AUTHOR INFO
                        if (isA && coTy != "comments") {
                            switch (au) {
                                case "Anonymous": case "Unknown":
                                    auur = "https://Mohanjeet.Blogspot.com";//f
                                    au = "Mohanjeet Singh";
                                    break;
                                default: auur = it.author[0].uri.$t;
                            }
                        }

                        //DATE
                        /* O >> var o=it.published.$t,
                          //                      c=o.substring(0,4),
                            //                    m=o.substring(5,7),
                              //                  h=o.substring(8,10),
                                //                u=month_format[parseInt(m,10)]+" "+h+", "+c,
                        
                             var h=(it.published.$t,it.content.$t,it.published.$t),
                                              v=h.split("T"),
                                              m=" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][(v=v[0].split("-"))[1]-1]+" "+v[2]+", "+v[0];
                                              */

                        //TITLE - DISPLAY AND NORMAL
                        let hD = hN = "";
                        (fTy == "q") ? (hN = '<blockquote class="blockquote">' + ti + '</blockquote>') : ((isH) && (hD = '<h3 class="display-5 mx-lg-5 ' + (isL ? "opacity-50" : "opacity-75") + '">' + ti + '</h3>', hN = '<h5 class="card-title fw-normal ' + ((fTy == "t" || fTy == "l" || fTy == "p") ? 'text-' + iThm : "") + '">' + ti + '</h5>'));

                        //SNIPPET & COMMENT AUTHOR
                        (fTy == "q") && (sni += '<figcaption class="small text-muted">' + au + '</figcaption>');
                        let c = "", z = "";
                        ("content" in it) ? (c = it.content.$t) : (("summary" in it) ? (c = it.summary.$t) : (("summary" in b_rc) ? (c = it.summary.$t) : ""));
                        //console.log({tit,c});

                        if (isS) {
                            //console.log({ tit, it, c, z });
                            (z = c.replace(/<\S[^>]*>/g, "")).length > 70 && (z = z.substring(0, snS) + "...");
                            sni = '<summary class="list-unstyled';
                            (thm == "light") ? sni += ' text-black-50' : sni += ' text-white-50';
                            (fTy == "v") && (sni += ' py-3 d-block mx-lg-5');
                            sni += isL ? " opacity-75" : "";
                            sni += '">' + z + '</summary>';
                        }

                        //LINK
                        let li = "";
                        for (let z = 0; z < it.link.length; z++) if ("alternate" == it.link[z].rel) { li = it.link[z].href; break; }
//                        console.log({tit},it.link[z].rel,it.link.length);

                        //IMAGE SETTINGS
                        let im = iU = iH = iV = "";
                        if (isI) {
                            let iU = iH = noImg;
                            z = $("<div>").html(c);
                            //console.log({iU,iH,c});
                            try {
                                if (coTy == 'comments') {
                                    iU = it.author[0].gd$image.src;
                                    (iU.match("blogblog.com")) && (iU = noImg);
                                }
                                else {
                                    //console.log({tit,c},c.indexOf("//www.youtube.com/embed/"));
                                    if (c.indexOf("//www.youtube.com/embed/") > -1) {
                                        iV = it.media$thumbnail.url;//v-mThumb	
                                        //console.log({tit,iV});
                                        (-1 !== iV.indexOf("img.youtube.com")) && (iV = iV.replace("/default.jpg", "/maxresdefault.jpg"));
                                    }
                                    if (c.indexOf("<img") > -1) {
                                        iU = z.find("img:first").attr("src");

                                        //Image Resolution Setting
                                        let s = 100;
                                        if (!isB) {
                                            if (isF) { s = iW; } else {
                                                switch (bC) {
                                                    case 1: s = iW;
                                                    case 2: iW < 768 ? s = iW : s = iW / 2;
                                                    case 3: iW < 768 ? s = iW : (iW < 992 ? s = iW / 2 : s = iW / 3);
                                                    case 4: iW < 576 ? s = iW : (iW < 768 ? s = iW / 2 : (iW < 992 ? s = iW / 3 : s = iW / 4));
                                                    case 5: iW < 576 ? s = iW / 2 : (iW < 768 ? s = iW / 3 : (iW < 1200 ? s = iW / 4 : s = iW / 5));
                                                    case 6: iW < 576 ? s = iW / 3 : (iW < 992 ? s = iW / 4 : (iW < 1200 ? s = iW / 5 : s = iW / 6));
                                                }
                                            }
                                        }

                                        (-1 !== iU.indexOf("/s72-c")) ? (iH = iU.replace("/s72-c", "/s1600")) : ((-1 !== iU.indexOf("/w640-h424")) ? iH = iU.replace("/w640-h424", "/s1600") : (iH = iU));
                                        (-1 !== iH.indexOf("/s1600")) && (iU = iH.replace("/s1600", "/s" + s));
                                        //console.log({s,iH,iU});
                                    }
                                }
                                (iV == "") && (iV = iU);
                            }
                            catch (err) { console.log(err.message); }
                            //console.log({bTy,fTy,ty,p,iU,iH});

                            let iS = " object-fit:cover;",
                                iC = ' h-100 w-100 img-fluid',
                                iSF = ' background:url(' + iU + ') fixed center center;background-size:cover;' + bH;
                            (fTy == "p") && (iC = ' ratio ratio-' + ar);
                            (isR) ? (iC += ' border border-5 border-opacity-75 border-' + thm) : (iC += ' border-0');
                            (fTy == "q") && (iS += ' height:6rem;width:6rem;', iSF += ' height:6rem;width:6rem;', iC = ' rounded-circle mx-auto');
                            iC += ' ' + cor;

                            (isB && !(coTy == "comments")) && (iC += ' blur-5');

                            let t = "";
                            if (fTy == "s") {
                                var y = (-1 !== iV.indexOf("img.youtube.com")) ? (iV.substr(iV.indexOf("/vi/") + 4, 11)) : "regular";
                                (p == 0) && (iC += ' regular', (t = '" data-toggle="tooltip" data-vidid="' + y + '"'));
                            }

                            if (isF) { im = '<figure class="m-0' + iC + '" style="' + iSF + '" role="img" loading="lazy" aria-label="' + ti + ' image"' + t + '></figure>'; }
                            else { im = '<img class="' + iC + '" style="' + iS + '" src="' + iU + '" alt="' + ti + ' image" loading="lazy" title="' + ti + '" ' + t + '/>'; }
                            //console.log({imS});
                        }//IMAGE SETTINGS

                        //CTA BUTTON (purely visual therefore button instead of a)
                        let ctaS = ctaL = "";
                        (isCTA) && (
                            ctaS = '<button class="btn btn-' + thm + ' bottom-0 end-0 me-3 mb-3 d-block position-absolute border-0 ' + cor + ' w-auto ' + (isL ? "opacity-50" : "opacity-75") + '" role="button" title="' + ti + '">' + cta + '</button>',
                            ctaF = '<button class="card-footer btn btn-' + thm + ' w-100 text-end border-0 ' + cor + '  ' + (isL ? "opacity-50" : "opacity-75") + ' link-' + iThm + ' ' + (fTy == "s" ? "p-3 px-lg-5" : "") + '" role="button" title="' + ti + '">' + cta + '</button>',
                            ctaL = '<button class="btn btn-' + thm + ' p-2 px-4 border-0 mx-lg-5' + cor + ' ' + (isL ? "opacity-50" : "opacity-75") + '" role="button" title="' + ti + '">' + cta + '</button>',
                            ctaC = '');

                        //CAROUSEL INDICATORS
                        (isCa && (p % (aC * bR) == 0)) && ($(cI).append('<button type="button" data-bs-target="#m' + mID + '" data-bs-slide-to="' + p / (aC * bR) + '" class="bg-'+iThm + (p == 0 ? (' active" aria-current="true"') : '"') + ' aria-label="Slide ' + (p / (aC * bR) + 1) + '"></button>'));
                        //(p<(bP-1)||(fTy=="v"&&(p<l-1)))

                        //SHOWCASE
                        if (isC) {
                            if (fTy == "s" && p == 0) {
                                $(a1).before('<div class="feature-image card border-0 text-center bg-' + thm + ' ' + ((cor == "") ? (' rounded-5 rounded-bottom') : cor) + ' overflow-hidden"><div class="sIframe" style="display:none;"></div>' + im + '<a class="link-' + iThm + '" href="' + li + '" title="' + ti + '">'+ ((isH)?('<div class="sContent card-img-overlay rounded-0 ' + (cor == "" && "rounded-top") + ' mx-md-5 p-3 px-lg-5 bg-' + thm + ' bg-opacity-75 mt-auto" style="height:fit-content;">' + hN + ' ' + sni + '</div>'):"") + ((isI||isCTA)?ctaF:"") + '</a></div>');
                            }
                        }

                        //WRAPPER - CAROUSEL & CONTENT
                        if (p == 0 || (isCa && p % (aC * bR) == 0) || (bTy == "l" && p == 1)) {
                            b += '<div style="' + (fTy != "s" ? bH : "") + '" class="row g-0';
                            isCa && ((b += ' carousel-item d-flex'), (p == 0) && (b += ' active'));
                            //isCa && console.log({ tit, bTy, fTy, p, b });
                            isC && ((fTy == "t") && (b += ' vstack'));
                            (fTy != "v") && (!(isC && (fTy == "t" || fTy == "c")) && (b += ' pb-'+bG), (isCa || isNav) && (b += ' px-2 px-sm-3 px-md-4 px-lg-5'));
                            switch (fC) {
                                case 1: b += ' row-cols-1">'; break;
                                case 2: b += ' row-cols-1 row-cols-sm-1 row-cols-md-2">'; break;
                                case 3: b += ' row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-3">'; break;
                                case 4: b += ' row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-4">'; break;
                                case 5: b += ' row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-4 row-cols-xl-5">'; break;
                                case 6: b += ' row-cols-3 row-cols-sm-4 row-cols-md-4 row-cols-lg-5 row-cols-xl-6">'; break;
                            }
                        }
                        //console.log({tit,p,b});

                        //BLOCK CONTENT
                        if (isC) { (fTy == "t" && p == 0) && (b += '<div class="col g-4 ">'); }

                        //ARTICLE START
                        b += '<article class="';
                        switch (fTy) {
                            case "v": (!isCa) && (b += ' card rounded-0 vh-100 border-0 overflow-hidden'); break;
                            case "g":
                            case "t": b += ' h-25'; break;
                            case "p": case "q": case "c": b += ' col'; break;
                            case "l": b += ' col h-100'; break;
                            case "s": b += ' col sPost'; break;
                        }
                        b += ' g-' + bG;
                        b += '"' + (fTy == "s" ? ('data-title="' + ti + '" data-link="' + li + '" data-summary="' + z + '" data-vidid="' + y + '" data-img="' + iV + '" data-toggle="tooltip"') : "") + ' role="article">';

                        //CARD START
                        switch (fTy) {
                            case "q": case "c": case "g": case "s": b += '<div class="card border-0 shadow-sm overflow-hidden h-100 ratio ratio-' + ar + '  ' + cor + ' bg-' + iThm + ' bg-opacity-25">'; break;
                            case "l": case "p": case "t": b += '<div class="card border-0 shadow-sm overflow-hidden ' + cor + (fTy == "l" ? (' ratio ratio-' + ar) : "") + ' h-100 bg-' + thm + ' bg-opacity-50">'; break;
                        }

                        //LINK START
                        if (fTy != "s") {
                            b += '<a class="h-100' + (fTy == "t" ? " row g-0 " : (fTy == "q"?" p-3":"")) + '" href="' + li + '" title="' + ti + '">';
                        }

                        //IMAGE
                        if (isI) {
                            b+= ((fTy == "t")?('<figure class="col-4 m-0">'):"") + im + ((fTy == "t")?('</figure>'):"");
                        }

                            //TEXT
                            if (fTy != "s") {
                            if (isH) {
                                (isI && fTy == "t") && (b += '<div class="col-8">');

                                switch (fTy) {
                                    case "v": b += '<div class="card-img-overlay p-3 px-lg-5 pb-5 text-center rounded-0 d-flex">'; break;
                                    case "g": case "c": b += '<div class="card-img-overlay text-bg-' + thm + ' bg-opacity-75 rounded-0">'; break;
                                    case "p": case "q": b += '<div class="card-body bg-' + thm + ' bg-opacity-75'+(fTy=="q"?" text-center":"")+'">'; break;
                                    case "t": b += '<div class="card-body bg-' + thm + ' bg-opacity-75 h-100">'; break;
                                    case "l": b += '<div class="card-img-overlay text-bg-' + thm + ' bg-opacity-75 rounded-0" style="height:10%;">Latest';
                                        b += '<div class="position-absolute bottom-0 bg-' + thm + ' bg-opacity-75 rounded-0 p-4 p-xl-5 w-100">'; break;
                                }

                                switch (fTy) {
                                    case "v": b += '<div class="text-bg-' + thm + ' bg-opacity-75 p-5 my-auto mx-lg-5';
                                        (tva == "top") && (b += ' mt-0');
                                        (tva == "bottom") && (b += ' mb-0');
                                        (cor == "") && (b += ' rounded-5');
                                        b += '">';
                                }

                                (fTy == "v") ? b += hD : b += hN;
                                b += sni;
                                (fTy == "v") && (b += ctaL);//CTA

                                (fTy == "v" || fTy == "l") && (b += '</div>');

                                b += '</div>';
                                (isI && fTy == "t") && (b += '</div>');
                            }//TEXT
                            (fTy != "v") && ((fTy == "p" || fTy=="q" )? b += ctaF : b += ctaS);//CTA
                            b += '</a>';
                        }//if s
                        switch (fTy) { case "q": case "c": case "g": case "s": case "l": b += '</div>'; }
                        b += '</article>';
                        if (isC) { (fTy == "t" && p == (l - 1)) && (b += '</div>'); }

                        isCa && ((p % (aC * bR) == (aC * bR - 1)) && (b += '</div>'), (fTy != "v") && (p == (l - 1) && (b += '</div>')));
                        //isCa&&console.log({tit,p,b});

                    }//feed

                    //COMPONENT STRUCTURE CLOSE
                    switch (bTy) {
                        case "t": case "g": b += '</div>'; break;
                        case "l": b += '</div></div>'; break;
                    }
                    (isCa || isNav) && (b += '</div>');
                    //CAROUSEL NAVIGATION AND WRAPPER CLOSURE
                    let L = R = "";
                    (isCa || isNav) && (L = '<button class="carousel-control-prev link-secondary' + (isNav ? " nav-prev" : " pb-4") + '" type="button" title="Click for Previous" data-bs-target="#m' + mID + '" data-bs-slide="prev" style="width:5%;"><svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-left-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"></path></svg><span class="visually-hidden">Previous</span></button>', R = '<button class="carousel-control-next link-secondary' + (isNav ? " nav-next" : " pb-4") + '" title="Click for Next" type="button" data-bs-target="#m' + mID + '" data-bs-slide="next" style="width:5%;"><svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-right-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg><span class="visually-hidden">Next</span></button>');
                    //(isCa) && ($(a1).append(L, R));
                    (isCa) && (b += L + R);
                    $(a1).append(b);
                    $(a1).append(cI);
                    (isNav) && ((cuSt > 1) && ($(a1).append(L)), (cuSt < nuSt) && ($(a1).append(R)));
                }//if
                else {
                    switch (coTy) {
                        case "recent": $(a1).append('<h2 class="text-center p-4 w-100">Nothing was posted recently!</h2>'); break;
                        case "comments": $(a1).append('<h2 class="text-center p-4 w-100">Be the first one to comment!</h2>'); break;
                        default: $(a1).append('<h3 class="text-center p-4 w-100">No content found for "' + la + '"!</h3>');
                    }
                }
                //                    console.log(b);

                //BLOCK FOOTER - JUMP-LINK
                //console.log((!(!isMo && bTy=='v')),ty);
                let n = "";
                (!(!isMo && bTy == 'v')) && (n += '<nav aria-label="Page navigation" class="st' + cuSt + ' w-100 pe-5 py-5 pagination justify-content-end bg-' + thm + '">');
                if (isMo) {
                    for (i = 0; i < fe.feed.link.length; i++) {
                        var r = fe.feed.link[i];
                        if ("alternate" == r.rel) {
                            var moLi = r.href;
                            //console.log(tit,r,r.href,r.rel);
                            n += '<a class="text-bg-' + thm + ' border-0 ' + (isL ? "opacity-50" : "opacity-75") + '" href="' + moLi + '?&max-results=12" title="Click for More">' + mo + ' <svg class="bi bi-caret-right-fill" fill="currentColor" height="1em" viewBox="0 0 16 16" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg></a>';
                        }
                    }
                }
                (!(!isMo && bTy == 'v')) && (n += '</nav>');
                $(a1).after(n);
            },//success
            complete: function () {
                let m = $(a1);
                //NAV
                if (isNav) {
                    m.find(".nav-prev").unbind('click').click(function () {
                        const s = (el.attr("data-s"));
                        el.attr("data-s", +s - 1);
                        //console.log(s-2);
                        //console.log(el);
                        //console.log(el.attr("data-s"));
                        el.find(".st" + s).fadeOut(); el.find(".st" + (s - 1)).fadeIn();
                    });
                    m.find(".nav-next").unbind('click').click(function () {
                        const s = (el.attr("data-s"));
                        el.find(".st" +s).fadeOut();
                        //console.log(m.find(".st" +s).length==0);
                        el.attr("data-s", +s + 1);
                        t = el.find(".st" + (+s + 1)).length;
                        console.log({m,s, t, b }, t == 0);
                        (t == 0) ? (mBlocks(el)) : el.find(".st" + (+s + 1)).fadeIn();
                    });
                }//if
                //SHOWCASE
                if (bTy == "s") {
                    const F = m.find(".feature-image");
                    const f = F.find("figure"), i = F.find(".sIframe"), c = F.find(".sContent");
                    f.click(function () {
                        var e = $(this).attr("data-vidid");
                        if (e !== "regular") {
                            const v = '<iframe src="https://www.youtube.com/embed/' + e + '?autoplay=1" allowfullscreen="" style="' + bH + 'width:100%;" frameborder="0"></iframe>'; i.html(v), i.fadeIn(0), f.fadeOut(0), c.fadeOut(0);
                        }
                    }),
                        m.find(".sPost").map(function () {
                            $(this).click(function () {
                                const i = $(this).attr("data-img"),
                                    v = $(this).attr("data-vidid"),
                                    t = $(this).attr("data-title"),
                                    s = $(this).attr("data-summary"),
                                    l = $(this).attr("data-link");
                                (v.toLowerCase() != "regular") ? (ti = "Click here to load the video!") : (ti = t);
                                f.attr({ style: "background:url(" + i + ") center center;background-size:cover;" + bH, "data-vidid": v, title: ti, "aria-label": ti });
                                m.find(".sIframe").html("").fadeOut(0),
                                    f.fadeIn(0),
                                    m.find(".sC").fadeIn(0);
                                c.find("h5").html(t),
                                    c.find("summary").html(s),
                                    F.find("a").attr({ href: l, title: t });
                                F.find("button").attr("title", t);
                            })
                        })
                }
                //(isCa)&&console.log(b);
                //console.log(b);
            }//complete
        })//ajax
    });//$
}
$(document).ready(function () { mBlocks('.mBlock') });
