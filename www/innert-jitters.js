/*

inert-jitters : Plan Ingress fields based on walking paths between groups of portals.

Copyright (C) 2019, Jeffrey J. Weston <jjweston@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

var map;

class Control extends L.Control
{
    constructor( element )
    {
        super();
        this.element = element;
    }

    onAdd( map )
    {
        return this.element;
    }
}

function displayMessage( message )
{
    document.getElementById( "messageText" ).textContent = message;
    document.getElementById( "message" ).style.display = "block";
}

function init()
{
    var layerUrl = "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}";
    var layerConfig =
    {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, " +
                     "<a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, " +
                     "Imagery &copy; <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 20,
        id: "mapbox.streets",
        accessToken: accessToken
    };

    map = L.map( "map" ).setView( [ 40, -98 ], 4 );
    L.tileLayer( layerUrl, layerConfig ).addTo( map );

    new Control( document.getElementById( "startAddPortal" )).addTo( map );
    new Control( document.getElementById( "addPortal"      )).addTo( map );
    new Control( document.getElementById( "message"        )).addTo( map );

    L.DomEvent.disableClickPropagation( document.getElementById( "addPortal" ));

    document.getElementById( "addPortal" ).style.display = "none";
    document.getElementById( "message"   ).style.display = "none";

    document.getElementById( "startAddPortal"     ).addEventListener( "click", startAddPortalClick );
    document.getElementById( "submitPortalButton" ).addEventListener( "click", submitPortal        );
    document.getElementById( "cancelPortalButton" ).addEventListener( "click", cancelPortal        );
    document.getElementById( "messageButton"      ).addEventListener( "click", clearMessage        );
}

function startAddPortalClick()
{
    document.getElementById( "portalUrl" ).value = "";
    document.getElementById( "message"   ).style.display = "none";
    document.getElementById( "addPortal" ).style.display = "block";
}

function submitPortal()
{
    var portalUrl = new URL( document.getElementById( "portalUrl" ).value );
    var portalLocation = portalUrl.searchParams.get( "pll" ).split( "," );
    var portalLatitude  = parseFloat( portalLocation[ 0 ] );
    var portalLongitude = parseFloat( portalLocation[ 1 ] );
    L.marker( [ portalLatitude, portalLongitude ] ).addTo( map );
    document.getElementById( "addPortal" ).style.display = "none";
    displayMessage( "Portal added." );
}

function cancelPortal()
{
    document.getElementById( "addPortal" ).style.display = "none";
}

function clearMessage()
{
    document.getElementById( "message" ).style.display = "none";
}
