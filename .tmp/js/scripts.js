!function($) {
    function initGooglePlus() {
        var po = document.createElement("script");
        po.type = "text/javascript", po.async = !0, po.src = "https://apis.google.com/js/platform.js";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(po, s);
    }
    function initialize() {
        function calcRoute(origin, selectedMode) {
            var request = {
                origin: origin,
                destination: eventPlace,
                travelMode: google.maps.TravelMode[selectedMode]
            };
            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    map.setMapTypeId("zoomed"), directionsDisplay.setMap(map), directionsDisplay.setDirections(response);
                    var leg = response.routes[0].legs[0];
                    makeMarker(leg.start_location), makeMarker(leg.end_location), $("#distance").text(leg.distance.text), 
                    $("#estimateTime").text(leg.duration.text), $("#mode-select").val(selectedMode), 
                    $("#mode").removeClass("hidden");
                    var attribute = $("#mode-icon use").attr("xlink:href");
                    attribute = attribute.substring(0, attribute.indexOf("#") + 1) + "icon-" + selectedMode.toLowerCase(), 
                    $("#mode-icon use").attr("xlink:href", attribute);
                } else if (status != google.maps.DirectionsStatus.OK && "DRIVING" != selectedMode) calcRoute(origin, "DRIVING"); else {
                    var path = polyline.getPath();
                    path.push(origin), path.push(eventPlace), makeMarker(origin), makeMarker(eventPlace);
                    var bounds = new google.maps.LatLngBounds();
                    bounds.extend(origin), bounds.extend(eventPlace), map.fitBounds(bounds), polyline.setMap(map);
                    var distance = Math.round(google.maps.geometry.spherical.computeDistanceBetween(origin, eventPlace) / 1e3);
                    $("#distance").text(distance + " km"), $("#estimateTime").text(""), $("#find-flight").removeClass("hidden"), 
                    $("#mode").addClass("hidden");
                }
            }), deleteMarkers(), $("#find-way").addClass("location-active"), setDirectionInput(origin), 
            $("#find-way h3").removeClass("fadeInUp").addClass("fadeOutDown");
        }
        function calcRouteFromMyLocation() {
            navigator.geolocation && navigator.geolocation.getCurrentPosition(function(position) {
                origin = new google.maps.LatLng(position.coords.latitude, position.coords.longitude), 
                calcRoute(origin, "TRANSIT");
            });
        }
        function makeMarker(position) {
            var directionMarker = new google.maps.Marker({
                position: position,
                map: map,
                icon: icon
            });
            markers.push(directionMarker);
        }
        function deleteMarkers() {
            for (var i = 0; i < markers.length; i++) markers[i].setMap(null);
            markers = [];
        }
        function smoothZoom(level) {
            for (var currentZoom = map.getZoom(), timeStep = 50, numOfSteps = Math.abs(level - currentZoom), step = level > currentZoom ? 1 : -1, i = 0; numOfSteps > i; i++) setTimeout(function() {
                currentZoom += step, map.setZoom(currentZoom);
            }, (i + 1) * timeStep);
        }
        function setDirectionInput(origin) {
            geocoder.geocode({
                latLng: origin
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK && results[1]) {
                    var arrAddress = results[1].address_components;
                    $.each(arrAddress, function(i, address_component) {
                        return "locality" == address_component.types[0] ? ($("#result-name").text(address_component.long_name), 
                        !1) : void 0;
                    });
                }
            });
        }
        directionsDisplay = new google.maps.DirectionsRenderer({
            suppressMarkers: !0
        }), geocoder = new google.maps.Geocoder(), polyline = new google.maps.Polyline({
            strokeColor: "#03a9f4",
            strokeOpacity: 1,
            strokeWeight: 2
        });
        var defaultOpts = [ {
            stylers: [ {
                lightness: 40
            }, {
                visibility: "on"
            }, {
                gamma: .9
            }, {
                weight: .4
            } ]
        }, {
            elementType: "labels",
            stylers: [ {
                visibility: "on"
            } ]
        }, {
            featureType: "water",
            stylers: [ {
                color: "#5dc7ff"
            } ]
        }, {
            featureType: "road",
            stylers: [ {
                visibility: "off"
            } ]
        } ], zoomedOpts = [ {
            stylers: [ {
                lightness: 40
            }, {
                visibility: "on"
            }, {
                gamma: 1.1
            }, {
                weight: .9
            } ]
        }, {
            elementType: "labels",
            stylers: [ {
                visibility: "off"
            } ]
        }, {
            featureType: "water",
            stylers: [ {
                color: "#5dc7ff"
            } ]
        }, {
            featureType: "road",
            stylers: [ {
                visibility: "on"
            } ]
        }, {
            featureType: "road",
            elementType: "labels",
            stylers: [ {
                saturation: -30
            } ]
        } ], mapOptions = {
            zoom: 17,
            minZoom: 2,
            scrollwheel: !1,
            panControl: !1,
            draggable: !0,
            zoomControl: !1,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            },
            scaleControl: !1,
            mapTypeControl: !1,
            streetViewControl: !1,
            center: centerMap,
            mapTypeControlOptions: {
                mapTypeIds: [ google.maps.MapTypeId.ROADMAP, MY_MAPTYPE_ID ]
            },
            mapTypeId: MY_MAPTYPE_ID
        };
        $(window).width() < 768 && (mapOptions.center = mobileCenterMap), "logistics" == googleMaps && (mapOptions.zoom = 5, 
        mapOptions.zoomControl = !0), map = new google.maps.Map(document.getElementById("canvas-map"), mapOptions);
        var marker = new google.maps.Marker({
            position: eventPlace,
            animation: google.maps.Animation.DROP,
            icon: icon,
            map: map
        });
        markers.push(marker);
        var defaultMapOptions = {
            name: "Default Style"
        }, zoomedMapOptions = {
            name: "Zoomed Style"
        }, defaultMapType = new google.maps.StyledMapType(defaultOpts, defaultMapOptions), zoomedMapType = new google.maps.StyledMapType(zoomedOpts, zoomedMapOptions);
        if (map.mapTypes.set("default", defaultMapType), map.mapTypes.set("zoomed", zoomedMapType), 
        "logistics" === googleMaps) {
            map.setMapTypeId("default");
            var input = document.getElementById("location-input");
            autocomplete = new google.maps.places.Autocomplete(input), google.maps.event.addListener(autocomplete, "place_changed", function() {
                marker.setVisible(!1);
                var place = autocomplete.getPlace();
                if ("undefined" != place.geometry && place.geometry) {
                    var address = "";
                    place.address_components && (address = [ place.address_components[0] && place.address_components[0].short_name || "", place.address_components[1] && place.address_components[1].short_name || "", place.address_components[2] && place.address_components[2].short_name || "" ].join(" ")), 
                    geocoder.geocode({
                        address: address
                    }, function(results, status) {
                        status == google.maps.GeocoderStatus.OK ? (origin = results[0].geometry.location, 
                        calcRoute(origin, "TRANSIT")) : alert("Geocode was not successful for the following reason: " + status);
                    });
                }
            });
        } else map.setMapTypeId("zoomed");
        $("#mode-select").change(function() {
            var selectedMode = $(this).val();
            calcRoute(origin, selectedMode);
        }), $("#direction-locate").click(calcRouteFromMyLocation), $("#direction-cancel").click(function() {
            $("#find-way").removeClass("location-active"), $("#location-input").val(""), $("#find-flight").addClass("hidden"), 
            deleteMarkers(), directionsDisplay.setMap(null), polyline.setMap(null), map.setMapTypeId("default"), 
            map.panTo(eventPlace), map.setCenter($(window).width() < 768 ? mobileCenterMap : centerMap), 
            makeMarker(eventPlace), smoothZoom(5), $("#find-way h3").removeClass("fadeOutDown").addClass("fadeInUp");
        }), "undefined" != typeof autoDirectionEnabled && 1 == autoDirectionEnabled && calcRouteFromMyLocation();
    }
    if ($(document).ready(function() {
        function linkify(inputText) {
            var replacedText, links1, links2, hashtags, profileLinks;
            return links1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim, 
            replacedText = inputText.replace(links1, '<a href="$1" target="_blank">$1</a>'), 
            links2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim, replacedText = replacedText.replace(links2, '$1<a href="http://$2" target="_blank">$2</a>'), 
            hashtags = /#(\S*)/g, replacedText = replacedText.replace(hashtags, '<a href="https://twitter.com/search?q=%23$1" target="_blank">#$1</a>'), 
            profileLinks = /\B@([\w-]+)/gm, replacedText = replacedText.replace(profileLinks, '<a href="https://twitter.com/$1" target="_blank">@$1</a>');
        }
        function animateTweets() {
            function changeTweets() {
                var next = ++i % $tweets.length;
                $($tweets.get(next - 1)).addClass("hidden"), $($tweets.get(next)).removeClass("hidden");
            }
            var $tweets = $("#tweets").find(".tweet"), i = 0;
            $($tweets.get(0)).removeClass("hidden");
            setInterval(changeTweets, 5e3);
        }
        Waves.displayEffect(), $(window).load(function() {
            $("#st-container").removeClass("disable-scrolling"), $("#loading-animation").fadeOut(), 
            $("#preloader").delay(350).fadeOut(800), initGooglePlus(), equalheight(".same-height");
        }), $(window).width() > 1500 && $(".effect-wrapper").addClass("col-lg-3"), $(window).width() < 768 && ($(".animated").removeClass("animated").removeClass("hiding"), 
        $(".stat span").removeClass("timer"), $(".timeslot-label").addClass("stick-label")), 
        $(window).height() < 512 && $("#bottom-navlinks").removeClass("bottom-navlinks").addClass("bottom-navlinks-small"), 
        $(window).scrollTop() >= 100 && ($("#top-header").addClass("after-scroll"), $("#logo-header .logo").removeClass("logo-light").addClass("logo-dark")), 
        $(window).scroll(function() {
            var scroll = $(this).scrollTop(), header = $("#top-header"), logo = $("#logo-header .logo"), buyButton = $(".right-nav-button"), topOffset = header.height() + $(".track-header").height();
            scroll >= 100 ? (header.addClass("after-scroll"), logo.removeClass("logo-light").addClass("logo-dark")) : (header.removeClass("after-scroll"), 
            logo.removeClass("logo-dark").addClass("logo-light")), scroll >= $(".top-section").height() && $(window).width() > 767 ? buyButton.removeClass("right-nav-button-hidden") : scroll < $(".top-section").height() && $(window).width() > 767 && buyButton.addClass("right-nav-button-hidden"), 
            $(".slot").each(function() {
                var currentPosition = $(this).offset().top - scroll, offsetActivator = topOffset + $(this).find(".slot-title").height();
                offsetActivator >= currentPosition && currentPosition >= 0 && $(".track-header.sticky").find(".slot-detail").html($(this).data("slotDetail"));
            });
        }), $(window).resize(function() {
            $(window).width() > 1500 ? $(".effect-wrapper").addClass("col-lg-3") : $(".effect-wrapper").removeClass("col-lg-3"), 
            $(window).width() < 768 ? ($(".same-height").css("height", "100%"), $(".timeslot-label").addClass("stick-label")) : ($(".timeslot-label").removeClass("stick-label"), 
            container.hasClass("st-menu-open") && (container.removeClass("st-menu-open"), $("body").css("overflow", "auto")), 
            equalheight(".same-height")), $(window).height() < 512 ? ($(".st-menu").addClass("scrollable"), 
            $("#bottom-navlinks").removeClass("bottom-navlinks").addClass("bottom-navlinks-small")) : ($(".st-menu").removeClass("scrollable"), 
            $("#bottom-navlinks").removeClass("bottom-navlinks-small").addClass("bottom-navlinks"));
        }), $(function() {
            $("a[href*=#]:not([href=#])").click(function() {
                if (location.pathname.replace(/^\//, "") == this.pathname.replace(/^\//, "") && location.hostname == this.hostname) {
                    var target = $(this.hash);
                    if (target = target.length ? target : $("[name=" + this.hash.slice(1) + "]"), target.length) return $("html,body").animate({
                        scrollTop: target.offset().top
                    }, 1e3), !1;
                }
            });
        }), $(function() {
            $("a[href=#]").click(function() {
                event.preventDefault();
            });
        }), $(function() {
            if (window.location.href.indexOf("schedule") > -1 && window.location.hash) {
                var hash = window.location.hash;
                $(hash).click();
            }
        }), $(function() {
            var delay, i, offset, _i, _len, _ref;
            for (_ref = $(".appear-animation"), _i = 0, _len = _ref.length; _len > _i; _i++) i = _ref[_i], 
            offset = i.offsetLeft + i.offsetTop, delay = offset / 1e3, $(i).css("transition-delay", "" + .47 * delay + "s"), 
            $(i).css("transition-duration", "0.2s");
        }), $(".appear-animation-trigger").appear(function() {
            setTimeout(function() {
                $(".appear-animation-trigger").parent("div").find(".appear-animation").addClass("visible");
            }, 1e3);
        }), $(window).width() >= 768 && $(".animated").appear(function() {
            var element = $(this), animation = element.data("animation"), animationDelay = element.data("delay");
            animationDelay ? setTimeout(function() {
                element.addClass(animation + " visible"), element.removeClass("hiding"), element.hasClass("counter") && element.find(".timer").countTo();
            }, animationDelay) : (element.addClass(animation + " visible"), element.removeClass("hiding"), 
            element.hasClass("counter") && element.find(".timer").countTo());
        }, {
            accY: -150
        }), equalheight = function(container) {
            var $el, currentTallest = 0, currentRowStart = 0, rowDivs = new Array();
            $(container).each(function() {
                if ($el = $(this), $($el).height("auto"), topPostion = $el.position().top, currentRowStart != topPostion) {
                    for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) rowDivs[currentDiv].height(currentTallest);
                    rowDivs.length = 0, currentRowStart = topPostion, currentTallest = $el.height(), 
                    rowDivs.push($el);
                } else rowDivs.push($el), currentTallest = currentTallest < $el.height() ? $el.height() : currentTallest;
                for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) rowDivs[currentDiv].height(currentTallest);
            });
        };
        var container = $(".st-container");
        $("#menu-trigger").click(function(event) {
            event.stopPropagation(), container.toggleClass("st-menu-open");
        }), $(".st-pusher").click(function() {
            container.hasClass("st-menu-open") && container.removeClass("st-menu-open");
        }), $(".track-header").each(function() {
            for (var scheduleFirstSlotText, slot = $(this).closest(".schedule-table").find(".slot").first(); void 0 === scheduleFirstSlotText; ) scheduleFirstSlotText = slot.data("slotDetail"), 
            slot = slot.next();
            $(this).find(".slot-detail").html(scheduleFirstSlotText);
        }), $("#post-section .post-body p").each(function() {
            if ($(this).find(".feature-image").length) {
                var url = $(this).find(".feature-image").prop("src");
                $("#top-section").css("background-image", "url(" + url + ")").addClass("enable-overlay");
            }
        }), $(".slider").each(function() {
            $(this).find(".slider-item").first().addClass("slider-current-item").removeClass("hidden"), 
            $(this).find(".slider-item").length > 1 && $(this).closest(".speaker-item").find(".slider-next-item").removeClass("hidden");
        }), $(".slider-next-item").click(function() {
            var slider = $(this).closest("div"), elem = slider.find(".slider-current-item").next();
            elem.length ? (elem.addClass("slider-current-item").removeClass("hidden"), slider.find(".slider-current-item").first().removeClass("slider-current-item").addClass("hidden")) : (slider.find(".slider-item").first().addClass("slider-current-item").removeClass("hidden"), 
            slider.find(".slider-current-item").last().removeClass("slider-current-item").addClass("hidden"));
        }), $(".modal").on("hidden.bs.modal", function() {
            var iframe = $(this).find("iframe");
            iframe.attr("src", iframe.attr("src"));
        }), $(".slot").click(function() {
            location.hash = $(this).attr("id");
        }), "undefined" != typeof twitterFeedUrl && $.getJSON(twitterFeedUrl, function(data) {
            $.each(data, function(i, gist) {
                var tweetElement = '<div class="tweet animated fadeInUp hidden"><p class="tweet-text">' + linkify(gist.text) + '</p><p class="tweet-meta">by <a href="https://twitter.com/' + gist.user.screen_name + '" target="_blank">@' + gist.user.screen_name + "</a></p></div>";
                $("#tweets").append(tweetElement);
            }), animateTweets();
        });
    }), "undefined" != typeof staticGoogleMaps && $("#canvas-map").addClass("image-section").css("background-image", "url(http://maps.googleapis.com/maps/api/staticmap?zoom=17&center=" + mobileCenterMapCoordinates + "&size=" + $(window).width() + "x700&scale=2&language=en&markers=icon:" + icon + "|" + eventPlaceCoordinates + "&maptype=roadmap&style=visibility:on|lightness:40|gamma:1.1|weight:0.9&style=element:labels|visibility:off&style=feature:water|hue:0x0066ff&style=feature:road|visibility:on&style=feature:road|element:labels|saturation:-30)"), 
    "undefined" != typeof googleMaps) {
        var map, autocomplete, directionsDisplay, geocoder, polyline, origin, markers = [], directionsService = new google.maps.DirectionsService(), MY_MAPTYPE_ID = "custom_style";
        google.maps.event.addDomListener(window, "load", initialize);
    }
}(jQuery);