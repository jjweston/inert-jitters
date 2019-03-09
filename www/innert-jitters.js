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
var portals = new Map();

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

function resetControls()
{
    document.getElementById( "startAddPortal" ).classList.remove( "selected" );
    document.getElementById( "listPortals"    ).classList.remove( "selected" );

    document.getElementById( "addPortal"  ).style.display = "none";
    document.getElementById( "portalList" ).style.display = "none";
}

function displayError( error )
{
    document.getElementById( "errorText" ).textContent = error;
    document.getElementById( "errorText" ).style.display = "block";
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

    new Control( document.getElementById( "navigation" )).addTo( map );
    new Control( document.getElementById( "addPortal"  )).addTo( map );
    new Control( document.getElementById( "portalList" )).addTo( map );

    L.DomEvent.disableClickPropagation( document.getElementById( "navigation" ));
    L.DomEvent.disableClickPropagation( document.getElementById( "addPortal"  ));
    L.DomEvent.disableClickPropagation( document.getElementById( "portalList" ));

    document.getElementById( "addPortal"  ).style.display = "none";
    document.getElementById( "portalList" ).style.display = "none";

    document.getElementById( "startAddPortal"     ).addEventListener( "click", startAddPortalClick );
    document.getElementById( "listPortals"        ).addEventListener( "click", listPortalsClick    );
    document.getElementById( "submitPortalButton" ).addEventListener( "click", submitPortal        );
    document.getElementById( "cancelPortalButton" ).addEventListener( "click", cancelPortal        );
}

function startAddPortalClick()
{
    if ( activity == "addPortal" ) return;
    activity = "addPortal";

    resetControls();
    document.getElementById( "startAddPortal" ).classList.add( "selected" );
    document.getElementById( "portalName" ).value = "";
    document.getElementById( "portalUrl" ).value = "";
    document.getElementById( "errorText" ).style.display = "none";
    document.getElementById( "addPortal" ).style.display = "block";
    document.getElementById( "portalName" ).focus();
}

function listPortalsClick()
{
    if ( activity == "listPortals" ) return;
    if ( portals.size == 0 ) return;
    activity = "listPortals";

    resetControls();
    document.getElementById( "listPortals" ).classList.add( "selected" );
    document.getElementById( "portalList" ).style.display = "block";
}

function submitPortal()
{
    var portalName = document.getElementById( "portalName" ).value.trim();
    if ( portalName.length == 0 )
    {
        displayError( "You must specify a portal name." );
        return;
    }

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

    var portalLocationString = portalUrl.searchParams.get( "pll" );
    var portalLocationSplits = portalLocationString.split( "," );
    if ( portalLocationSplits.length != 2 )
    {
        displayError( "Invalid portal location." );
        return;
    }

    var portalLatitude  = parseFloat( portalLocationSplits[ 0 ] );
    var portalLongitude = parseFloat( portalLocationSplits[ 1 ] );
    if (( Number.isNaN( portalLatitude )) || ( Number.isNaN( portalLongitude )))
    {
        displayError( "Unable to parse portal location." );
        return;
    }

    if ( portals.has( portalLocationString ))
    {
        displayError( "Portal already exists." );
        return;
    }

    var portalMarker = L.marker( [ portalLatitude, portalLongitude ], { title: portalName, alt: "Portal" } );
    portalMarker.addTo( map );
    portals.set( portalLocationString, portalMarker );

    document.getElementById( "startAddPortal" ).classList.remove( "selected" );
    document.getElementById( "addPortal" ).style.display = "none";

    var row = document.getElementById( "portalTable" ).insertRow( -1 );
    row.className = "portalList";

    var nameCell = row.insertCell( -1 );
    nameCell.className = "portalList";
    nameCell.textContent = portalName;

    var latitudeCell = row.insertCell( -1 );
    latitudeCell.className = "portalList";
    latitudeCell.textContent = portalLatitude;

    var longitudeCell = row.insertCell( -1 );
    longitudeCell.className = "portalList";
    longitudeCell.textContent = portalLongitude;

    var removeCell = row.insertCell( -1 );
    removeCell.className = "portalList";
    var removeLink = document.createElement( "a" );
    removeLink.portalLocationString = portalLocationString;
    removeLink.portalRow = row;
    removeLink.className = "removePortal";
    removeLink.textContent = "Remove";
    removeLink.addEventListener( "click", removePortal );
    removeCell.appendChild( removeLink );

    activity = null;
}

function cancelPortal()
{
    document.getElementById( "startAddPortal" ).classList.remove( "selected" );
    document.getElementById( "addPortal" ).style.display = "none";
    activity = null;
}

function removePortal( event )
{
    portals.get( event.target.portalLocationString ).remove();
    portals.delete( event.target.portalLocationString );
    event.target.portalRow.parentNode.removeChild( event.target.portalRow );

    if ( portals.size == 0 )
    {
        resetControls();
        activity = null;
    }
}
