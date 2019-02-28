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
var activity = null;

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

function displayError( error )
{
    document.getElementById( "errorText" ).textContent = error;
    document.getElementById( "error" ).style.display = "block";
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
    new Control( document.getElementById( "error"          )).addTo( map );

    L.DomEvent.disableClickPropagation( document.getElementById( "startAddPortal" ));
    L.DomEvent.disableClickPropagation( document.getElementById( "addPortal"      ));
    L.DomEvent.disableClickPropagation( document.getElementById( "message"        ));
    L.DomEvent.disableClickPropagation( document.getElementById( "error"          ));

    document.getElementById( "addPortal" ).style.display = "none";
    document.getElementById( "message"   ).style.display = "none";
    document.getElementById( "error"     ).style.display = "none";

    document.getElementById( "startAddPortal"     ).addEventListener( "click", startAddPortalClick );
    document.getElementById( "submitPortalButton" ).addEventListener( "click", submitPortal        );
    document.getElementById( "cancelPortalButton" ).addEventListener( "click", cancelPortal        );
    document.getElementById( "messageButton"      ).addEventListener( "click", clearMessage        );
    document.getElementById( "errorButton"        ).addEventListener( "click", clearError          );
}

function startAddPortalClick()
{
    if ( activity == "addPortal" ) return;
    activity = "addPortal";
    document.getElementById( "portalUrl" ).value = "";
    document.getElementById( "addPortal" ).style.display = "block";
    document.getElementById( "message"   ).style.display = "none";
    document.getElementById( "error"     ).style.display = "none";
}

function submitPortal()
{
    try
    {
        var portalUrl = new URL( document.getElementById( "portalUrl" ).value );
    }
    catch ( e )
    {
        displayError( "Invalid portal URL." );
        return;
    }

    if ( !portalUrl.searchParams.has( "pll" ))
    {
        displayError( "Unable to find portal location." );
        return;
    }

    var portalLocation = portalUrl.searchParams.get( "pll" ).split( "," );
    if ( portalLocation.length != 2 )
    {
        displayError( "Invalid portal location." );
        return;
    }

    var portalLatitude  = parseFloat( portalLocation[ 0 ] );
    var portalLongitude = parseFloat( portalLocation[ 1 ] );
    if (( Number.isNaN( portalLatitude )) || ( Number.isNaN( portalLongitude )))
    {
        displayError( "Unable to parse portal location." );
    }

    L.marker( [ portalLatitude, portalLongitude ] ).addTo( map );
    displayMessage( "Portal added." );

    document.getElementById( "addPortal" ).style.display = "none";
    document.getElementById( "error"     ).style.display = "none";
    activity = null;
}

function cancelPortal()
{
    document.getElementById( "addPortal" ).style.display = "none";
    document.getElementById( "error"     ).style.display = "none";
    activity = null;
}

function clearMessage()
{
    document.getElementById( "message" ).style.display = "none";
}

function clearError()
{
    document.getElementById( "error" ).style.display = "none";
}
