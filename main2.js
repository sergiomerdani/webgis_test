import "./style.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import Tile from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { Projection, transformExtent } from "ol/proj";
import TileWMS from "ol/source/tileWMS.js";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import Group from "ol/layer/Group";
import LayerGroup from "ol/layer/Group";
import { Draw, DragBox, Select, Modify } from "ol/interaction";
import { Point, LineString, Polygon } from "ol/geom";
import {
  click,
  shiftKeyOnly,
  platformModifierKeyOnly,
} from "ol/events/condition";
import { GeoJSON, WFS, WKT } from "ol/format";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import PrintDialog from "ol-ext/control/PrintDialog";
import Overlay from "ol/Overlay.js";

import CanvasAttribution from "ol-ext/control/CanvasAttribution";
import CanvasScaleLine from "ol-ext/control/CanvasScaleLine";
import CanvasTitle from "ol-ext/control/CanvasTitle";
import { Style, Text, Icon, Stroke, Fill } from "ol/style";
import CircleStyle from "ol/style/Circle.js";

import Legend from "ol-ext/legend/Legend";
import Layer from "ol/layer/Layer";
import { WMTSCapabilities } from "ol/format";
import { optionsFromCapabilities } from "ol/source/WMTS";
import WMTS from "ol/source/WMTS";
import { toStringHDMS } from "ol/coordinate.js";
import { fromLonLat, toLonLat } from "ol/proj.js";

proj4.defs(
  "EPSG:6870",
  "+proj=tmerc +lat_0=0 +lon_0=20 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);

proj4.defs(
  "EPSG:32634",
  "+proj=utm +zone=34 +datum=WGS84 +units=m +no_defs +type=crs"
);
register(proj4);

const projection6870 = new Projection({
  code: "EPSG:6870",
  extent: [-2963585.56, 3639475.76, 2404277.44, 9525908.77],
  worldExtent: [-90, -90, 90, 90],
});

const proj32634 = new Projection({
  code: "EPSG:32634",
  extent: [166021.44, 0.0, 833978.56, 9329005.18],
  worldExtent: [18.0, 0.0, 24.0, 84.0],
});

const krgjshCenter = [487634.64309, 4577027.351259];
const utmCenter = [401170.19359, 4575960.311822];

let asigMaps;

const osm = new TileLayer({
  source: new OSM({
    crossOrigin: "anonymous",
  }),
  title: "OSM",
});

const extent6870 = [
  394523.8243760248, 4378288.751098856, 601384.7112518024, 4736589.374424876,
];
const extent3857_v1 = [
  2206278.3844229993, 5060803.903397999, 2364259.4194297767, 5275222.025859494,
];
const extent4326 = [18.773065, 39.538499, 21.179343, 42.758209];
const extent3857 = transformExtent(extent6870, projection6870, "EPSG:4326");

// const orthoFarke = new TileLayer({
//   source: new TileWMS({
//     url: "http://localhost:8080/geoserver/my_workspace1/wms",
//     params: {
//       LAYERS: "my_workspace1:ortho_farke_KRGJSH",
//       VERSION: "1.1.0",
//     },
//   }),
//   visible: false,
//   title: "orthoFarke WMS",
//   information: "Kufiri i tokësor i republikës së Shqipërisë",
//   displayInLayerSwitcher: true,
// });

const shkshInstitucionet = new TileLayer({
  source: new TileWMS({
    url: "http://localhost:8080/geoserver/test/wms?service=WMS",
    params: {
      LAYERS: "test:points",
      VERSION: "1.1.0",
    },
    // crossOrigin: "anonymous",
  }),
  visible: false,
  title: "Shksh Institucionet",
  information: "Kufiri i tokësor i republikës së Shqipërisë",
  displayInLayerSwitcher: true,
});

const wfsVectorSourcePoints = new VectorSource({
  url: "http://localhost:8080/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test:points&maxFeatures=50&outputFormat=application/json",
  format: new GeoJSON(),
  attributions: "@geoserver",
});

//ADD WFS
const wfsVectorLayerPoints = new VectorLayer({
  source: wfsVectorSourcePoints,
  title: "Points",
  // crossOrigin: "anonymous",
  // opacity: 0,
  visible: true,
});

const wfsVectorSourcePolygon = new VectorSource({
  url: "http://localhost:8080/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test:polygon&maxFeatures=50&outputFormat=application/json",
  format: new GeoJSON(),
  attributions: "@geoserver",
});

//ADD WFS
const wfsVectorLayerPolygon = new VectorLayer({
  source: wfsVectorSourcePolygon,
  title: "Polygon",
  // crossOrigin: "anonymous",
  // opacity: 0,
  visible: true,
});

const wfsVectorSourceLine = new VectorSource({
  url: "http://localhost:8080/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test:line&maxFeatures=50&outputFormat=application/json",
  format: new GeoJSON(),
  attributions: "@geoserver",
});

//ADD WFS
const wfsVectorLayerLine = new VectorLayer({
  source: wfsVectorSourceLine,
  title: "Line",
  // crossOrigin: "anonymous",
  // opacity: 0,
  visible: true,
});

const shkshSherbimet = new TileLayer({
  source: new TileWMS({
    url: "http://localhost:8080/geoserver/test/wms?service=WMS",
    params: {
      LAYERS: "test:line",
      VERSION: "1.0.0",
    },
    // crossOrigin: "anonymous",
  }),
  visible: false,
  title: "Shksh Sherbimet",
  information: "Kufiri i tokësor i republikës së Shqipërisë",
  displayInLayerSwitcher: true,
});

asigMaps = new Group({
  layers: [shkshInstitucionet, shkshSherbimet],
  displayInLayerSwitcher: true,
  title: "Asig Raster",
});

const map = new Map({
  target: "map",
  layers: [osm],
  view: new View({
    projection: proj32634,
    center: utmCenter,
    zoom: 5,
  }),
});

// map.addLayer(shkshInstitucionet);
// map.addLayer(shkshSherbimet);
map.addLayer(wfsVectorLayerPoints);
map.addLayer(wfsVectorLayerPolygon);
map.addLayer(wfsVectorLayerLine);

//WMTS Ortho 2015
var wmts_parser = new WMTSCapabilities();
fetch("https://geoportal.asig.gov.al/service/wmts?request=getCapabilities")
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    var result = wmts_parser.read(text);
    var opt_ortho_2015_20 = optionsFromCapabilities(result, {
      layer: "orthophoto_2015:OrthoImagery_20cm",
      matrixSet: "EPSG:6870",
    });

    const orthoASIG = new Tile({
      name: "Ortofoto 2015 20cm WMTS",
      shortName: "2015 20cm",
      visible: false,
      source: new WMTS(opt_ortho_2015_20),
    });
    map.addLayer(orthoASIG);
  })
  .catch(function (error) {});

const layerList = [shkshInstitucionet, shkshSherbimet];

let fields = [];

//PRINT CONTROL AND LEGEND

map.addControl(new CanvasAttribution({ canvas: true }));
// // Add a title control
map.addControl(
  new CanvasTitle({
    title: "Map Title",
    visible: false,
    style: new Style({
      text: new Text({
        font: '20px "Lucida Grande",Verdana,Geneva,Lucida,Arial,Helvetica,sans-serif',
      }),
    }),
  })
);

// Add a ScaleLine control
const canvasScaleLine = new CanvasScaleLine();
map.addControl(canvasScaleLine);
const printControl = new PrintDialog({});
map.addControl(printControl);

// Legend
var legend = new Legend({
  title: "Legjenda",
  margin: 10,
  items: [],
});
let newItem, layerTitle, layer, clickedLayer;

const getLegendItems = legend.getItems().getArray();

const addNewItemToLegend = (layer) => {
  if (layer instanceof LayerGroup) {
    return;
  }
  newItem = {
    title: layer.get("title"),
    typeGeom: "Point",
    style: new Style({
      image: new Icon({
        src: layer.getSource().getLegendUrl(),
        crossOrigin: "anonymous",
      }),
    }),
  };
  legend.addItem(newItem);
};

// Customizing layer switcher functions
const layerGroups = [asigMaps];

const onChangeCheck = function (evt) {
  layer = evt;
  layerTitle = layer.get("title");
  const layerVisibility = layer.getVisible();

  clickedLayer = evt;

  const parentLayerGroup = findParentLayerGroup(clickedLayer);
  //Turn on the LayerGroup when a subLayer is visible
  if (parentLayerGroup && clickedLayer.getVisible()) {
    parentLayerGroup.setVisible(true);
    //Check if one of the subLayers it visible
  } else if (parentLayerGroup && hasVisibleSubLayer(parentLayerGroup)) {
    parentLayerGroup.setVisible(false);
  }

  const baseLayer = clickedLayer.get("title") === "Base Layers";
  try {
    const layers = evt.getLayers().getArray();
    //Turn on/off all the sublayers of the LayerGroup
    layers.forEach((subLayer) => {
      if (
        clickedLayer instanceof LayerGroup &&
        clickedLayer.values_.visible === true &&
        !baseLayer
      ) {
        subLayer.setVisible(true);
      } else {
        subLayer.setVisible(false);
      }
    });
  } catch (error) {}
};

function findParentLayerGroup(layer) {
  let parentLayerGroup = null;

  map.getLayers().forEach((group) => {
    if (group instanceof LayerGroup) {
      const layersInGroup = group.getLayers().getArray();
      if (layersInGroup.includes(layer)) {
        parentLayerGroup = group;
        return;
      }
    }
  });
  return parentLayerGroup;
}

// Function to check if at least one sub-layer within a layer group is visible
const hasVisibleSubLayer = function (layerGroup) {
  if (!(layerGroup instanceof LayerGroup)) {
    return false;
  }
  const layers = layerGroup.getLayers().getArray();
  let isAnySubLayerVisible = false;
  layers.forEach((subLayer) => {
    if (subLayer.getVisible()) {
      isAnySubLayerVisible = true;
    }
  });
  layerGroup.setVisible(isAnySubLayerVisible);
};
// Loop through each layer group and update its visibility
layerGroups.forEach((layerGroup) => {
  hasVisibleSubLayer(layerGroup);
});

//____________________________________________________________________

const layerSwitcher = new LayerSwitcher({
  collapsed: false,
  onchangeCheck: onChangeCheck,
  selection: true,
});
map.addControl(layerSwitcher);

let layerParam,
  layerType,
  vectorLayer,
  layerName,
  wfsVectorSource,
  formattedCoordinates,
  workspace,
  body,
  featureIDvalue,
  draw,
  modify;

layerSwitcher.on("select", (e) => {
  const layer = e.layer;
  const source = layer.getSource();
  const features = source.getFeatures();
  const url = source.getUrl();

  // Extract workspace and layer name from the URL
  const urlParts = new URL(url);
  const layerParam = urlParts.searchParams.get("typeName"); // Get the typeName parameter from the URL
  const [workspace, layerName] = layerParam.split(":"); // Split the typeName into workspace and layerName

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function getWfsVectorLayerByName(layerName) {
    // Assuming wfsVectorLayer is a global variable
    return "wfsVectorLayer" + capitalizeFirstLetter(layerName);
  }
  vectorLayer = getWfsVectorLayerByName(layerName);
  function getWfsSourceLayerByName(layerName) {
    // Assuming wfsVectorLayer is a global variable
    return "wfsVectorSource" + capitalizeFirstLetter(layerName);
  }
  wfsVectorSource = getWfsSourceLayerByName(layerName);

  // Assuming all features in the layer have the same geometry type
  const geometryType =
    features.length > 0 ? features[0].getGeometry().getType() : null;

  if (geometryType === "Point") {
    layerType = "Point";
  } else if (geometryType === "MultiPolygon") {
    layerType = "Polygon";
  } else if (geometryType === "MultiLineString") {
    layerType = "LineString";
  }
  console.log("Layer name:", layerName);
  console.log("Workspace:", workspace);
  console.log("Fullname:", layerParam);
  console.log("Geometry Type:", layerType);
  console.log(vectorLayer);
  console.log(wfsVectorSource);
});

const selectFeature = document.getElementById("selectFeature");
const modifyfeature = document.getElementById("modifyFeature");

//MODIFY INTERACTION
modifyfeature.addEventListener("click", (e) => {
  if (!vectorLayer) {
    alert("Please select a layer first.");
    return;
  }
  map.removeInteraction(draw);
  const modify = new Modify({ source: wfsVectorSource });
  map.addInteraction(modify);

  // Define a function to handle the geometry modification event
  modify.on("modifyend", function (event) {
    // Get the modified feature
    const modifiedFeature = event.features.item(0);
    // Get the modified geometry
    const modifiedGeometry = modifiedFeature.getGeometry().getCoordinates();
    if (layerType === "Polygon") {
      formattedCoordinates = modifiedGeometry[0][0]
        .map((coord) => `${coord[0]},${coord[1]}`)
        .join(" ");
      console.log(formattedCoordinates);
      body = `<wfs:Transaction service="WFS" version="1.0.0"
      xmlns:wfs="http://www.opengis.net/wfs"
      xmlns:ogc="http://www.opengis.net/ogc"
      xmlns:gml="http://www.opengis.net/gml"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd">
      <wfs:Update typeName="${layerParam}">
        <wfs:Property>
          <wfs:Name>geom</wfs:Name>
          <wfs:Value>
            <gml:Polygon srsName="EPSG:32634">
              <gml:outerBoundaryIs>
                <gml:LinearRing>
                  <gml:coordinates>${formattedCoordinates}</gml:coordinates>
                </gml:LinearRing>
              </gml:outerBoundaryIs>
            </gml:Polygon>
          </wfs:Value>
        </wfs:Property>
        <ogc:Filter>
          <ogc:FeatureId fid="${modifiedFeature.getId()}"/>
        </ogc:Filter>
      </wfs:Update>
    </wfs:Transaction>`;
    } else if (layerType === "LineString") {
      formattedCoordinates = modifiedGeometry
        .map((pairArray) => pairArray.map((pair) => pair.join(",")).join(" "))
        .join(" ");
      body = `<wfs:Transaction service="WFS" version="1.0.0"
        xmlns:topp="http://www.openplans.org/topp"
        xmlns:ogc="http://www.opengis.net/ogc"
        xmlns:wfs="http://www.opengis.net/wfs"
        xmlns:gml="http://www.opengis.net/gml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd">
        <wfs:Update typeName="${layerParam}">
          <wfs:Property>
            <wfs:Name>geom</wfs:Name>
            <wfs:Value>
              <gml:MultiLineString srsName="http://www.opengis.net/gml/srs/epsg.xml#32634">
                <gml:lineStringMember>
                  <gml:LineString>
                    <gml:coordinates>${formattedCoordinates}</gml:coordinates>
                  </gml:LineString>
                </gml:lineStringMember>
              </gml:MultiLineString>
            </wfs:Value>
          </wfs:Property>
          <ogc:Filter>
            <ogc:FeatureId fid="${modifiedFeature.getId()}"/>
          </ogc:Filter>
        </wfs:Update>
      </wfs:Transaction>`;
    } else if (layerType === "Point") {
      formattedCoordinates = modifiedGeometry.join(",");
      body = `<wfs:Transaction service="WFS" version="1.0.0"
      xmlns:wfs="http://www.opengis.net/wfs"
      xmlns:ogc="http://www.opengis.net/ogc"
      xmlns:gml="http://www.opengis.net/gml"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd">
      <wfs:Update typeName="${layerParam}">
        <wfs:Property>
          <wfs:Name>geom</wfs:Name>
          <wfs:Value>
            <gml:Point srsName="EPSG:32634">
              <gml:coordinates>${formattedCoordinates}</gml:coordinates>
            </gml:Point>
          </wfs:Value>
        </wfs:Property>
        <ogc:Filter>
          <ogc:FeatureId fid="${modifiedFeature.getId()}"/>
        </ogc:Filter>
      </wfs:Update>
    </wfs:Transaction>`;
    }

    // Send a WFS Transaction request to update the geometry
    const url = "http://localhost:8080/geoserver/test/ows";

    // Send the WFS Transaction request
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
      },
      body: body,
    })
      .then((response) => response.text())
      .then((data) => {
        console.log("Geometry updated successfully:", data);
      })
      .catch((error) => {
        console.error("Error updating geometry:", error);
      });
  });
});

//SELECT FEATURE
// Define a style for point features
const selectedPointStyle = new Style({
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({
      color: "red", // Set the fill color of the circle
    }),
    stroke: new Stroke({
      color: "rgba(254, 246, 0, 1)", // Set the border color of the circle
      width: 2, // Set the border width
    }),
  }),
});
const selected = new Style({
  fill: new Fill({
    color: "rgba(254, 246, 0, 1)",
  }),
  stroke: new Stroke({
    color: "rgba(254, 246, 0, 1)",
    width: 2,
  }),
});

function selectStyle(feature) {
  const geometry = feature.getGeometry();

  // Check if the feature's geometry is a point
  if (geometry instanceof Point) {
    return selectedPointStyle; // Return the selected style for points
  } else {
    const color = feature.get("COLOR") || "#eeeeee";
    selected.getFill().setColor(color);
    return selected;
  }
}

let selectSingleClick, featureID, url;

selectFeature.addEventListener("click", (e) => {
  map.removeInteraction(draw);
  map.removeInteraction(modify);
  selectSingleClick = new Select({ style: selectStyle, hitTolerance: 5 });
  map.addInteraction(selectSingleClick);

  selectSingleClick.on("select", function (e) {});
});

const drawFeatureWfs = document.getElementById("drawWfs");
// Draw Feature Event Listener
drawFeatureWfs.addEventListener("click", (e) => {
  if (!vectorLayer) {
    alert("Please select a layer first.");
    return; // Stop further execution
  }
  draw = new Draw({
    source: vectorLayer.getSource(),
    type: layerType,
  });

  map.addInteraction(draw);

  draw.on("drawend", function (event) {
    const feature = event.feature;
    const featureID = feature.getId();
    // Set the ID attribute to the feature
    const coordinates = feature.getGeometry().getCoordinates();
    if (layerType === "LineString") {
      // Map over the array and join each pair of coordinates with a space
      formattedCoordinates = coordinates
        .map((pair) => pair.join(","))
        .join(" ");
      console.log("Line Coordinates:", formattedCoordinates);
      body = `<wfs:Transaction service="WFS" version="1.0.0"
    xmlns:wfs="http://www.opengis.net/wfs"
    xmlns:test="http://www.openplans.org/test"
    xmlns:gml="http://www.opengis.net/gml"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd http://www.openplans.org http://localhost:8080/geoserver/wfs/DescribeFeatureType?typename=test:line">
    <wfs:Insert>
      <${layerName}>
        <${workspace}:geom>
          <gml:MultiLineString srsName="http://www.opengis.net/gml/srs/epsg.xml#32634">
            <gml:lineStringMember>
              <gml:LineString>
                <gml:coordinates decimal="." cs="," ts=" ">
                ${formattedCoordinates}
                </gml:coordinates>
              </gml:LineString>
            </gml:lineStringMember>
          </gml:MultiLineString>
        </${workspace}:geom>
        <${workspace}:TYPE>alley</${workspace}:TYPE>
      </${layerName}>
    </wfs:Insert>
    </wfs:Transaction>`;
    } else if (layerType === "Polygon") {
      const formattedData = coordinates.map((set) =>
        set
          .map((coord) => coord.join(","))
          .slice(0, -1)
          .join(" ")
      );
      // Join the formatted data by newline
      formattedCoordinates = formattedData.join("\n");
      console.log("Polygon Coordinates:", formattedCoordinates);
      body = `<wfs:Transaction service="WFS" version="1.0.0"
    xmlns:wfs="http://www.opengis.net/wfs"
    xmlns:test="http://www.openplans.org/test"
    xmlns:gml="http://www.opengis.net/gml"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd http://www.openplans.org http://localhost:8080/geoserver/wfs/DescribeFeatureType?typename=test:line">
    <wfs:Insert>
      <${layerName}>
        <${workspace}:geom>
          <gml:MultiLineString srsName="http://www.opengis.net/gml/srs/epsg.xml#32634">
            <gml:lineStringMember>
              <gml:LineString>
                <gml:coordinates decimal="." cs="," ts=" ">
                ${formattedCoordinates}
                </gml:coordinates>
              </gml:LineString>
            </gml:lineStringMember>
          </gml:MultiLineString>
        </${workspace}:geom>
        <${workspace}:TYPE>alley</${workspace}:TYPE>
      </${layerName}>
    </wfs:Insert>
    </wfs:Transaction>`;
    } else if (layerType === "Point") {
      formattedCoordinates = coordinates.join(",");
      console.log("Point Coordinates:", formattedCoordinates);
      body = `<wfs:Transaction service="WFS" version="1.0.0"
      xmlns:wfs="http://www.opengis.net/wfs"
      xmlns:test="http://www.openplans.org/test"
      xmlns:gml="http://www.opengis.net/gml"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd http://www.openplans.org http://localhost:8080/geoserver/wfs/DescribeFeatureType?typename=test:line">
      <wfs:Insert>
        <${layerName}>
          <${workspace}:geom>
          <gml:Point srsDimension="2" srsName="urn:x-ogc:def:crs:EPSG:32634">
          <gml:coordinates xmlns:gml="http://www.opengis.net/gml"
          decimal="." cs="," ts=" ">${formattedCoordinates}</gml:coordinates>
          </gml:Point>
          </${workspace}:geom>
          <${workspace}:TYPE>alley</${workspace}:TYPE>
        </${layerName}>
      </wfs:Insert>
      </wfs:Transaction>`;
    }

    url = "http://localhost:8080/geoserver/test/ows";

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
      },
      body: body,
    };

    // Make the POST request using the Fetch API
    fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // Parse the JSON response
        return response.text();
      })
      .then((data) => {
        wfsVectorSource.refresh();

        // Handle the data returned by the server
        console.log("Response from server:", data);
      })
      .catch((error) => {
        // Handle errors that occur during the fetch request
        console.error("There was a problem with your fetch operation:", error);
      });
  });
});

// DELETE WFS Event Listener
const deleteWFS = document.getElementById("deleteWfs");
deleteWFS.addEventListener("click", (e) => {
  if (!vectorLayer) {
    alert("Please select a layer first.");
    return;
  }
  if (!selectSingleClick) {
    alert("Please select a feature first.");
    return;
  }
  const selectedFeatures = selectSingleClick.getFeatures();
  const selectedFeaturesArray = selectedFeatures.getArray();
  selectedFeaturesArray.forEach((feature) => {
    // Do something with the feature
    wfsVectorSource.removeFeature(feature);
    const selectedFeatureValueID = feature.get("id");
    // You can perform any other operations with the feature here
    url = "http://localhost:8080/geoserver/test/ows";
    const body = `<wfs:Transaction service="WFS" version="1.0.0"
                  xmlns:cdf="http://www.opengis.net/cite/data"
                  xmlns:ogc="http://www.opengis.net/ogc"
                  xmlns:wfs="http://www.opengis.net/wfs"
                  xmlns:topp="http://www.openplans.org/topp">
                  <wfs:Delete typeName="${layerParam}">
                    <ogc:Filter>
                      <ogc:PropertyIsEqualTo>
                        <ogc:PropertyName>id</ogc:PropertyName>
                        <ogc:Literal>${selectedFeatureValueID}</ogc:Literal>
                      </ogc:PropertyIsEqualTo>
                    </ogc:Filter>
                  </wfs:Delete>
                </wfs:Transaction>`;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
      },
      body: body,
    };

    // Make the POST request using the Fetch API
    fetch(url, options)
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // Parse the JSON response
        return response.text();
      })
      .then((data) => {
        // Handle the data returned by the server
        console.log("Response from server:", data);
      })
      .catch((error) => {
        // Handle errors that occur during the fetch request
        console.error("There was a problem with your fetch operation:", error);
      });
  });
});

// Create a new overlay
const popup = new Overlay({
  element: document.getElementById("popup"),
  positioning: "bottom-center",
});
map.addOverlay(popup);

//GET INFO
const getInfoButton = document.getElementById("getInfo");

getInfoButton.addEventListener("click", (e) => {
  map.removeInteraction(draw);
  getFeatureInfo();
});

function getFeatureInfo() {
  // Define the tolerance value (in pixels)
  const tolerance = 5; // Adjust this value based on your requirements

  // Listen for single clicks on the map
  map.on("singleclick", function (event) {
    const coordinate = event.coordinate;
    // Get the clicked pixel
    const pixel = event.pixel;

    // Check if a feature is present within the specified tolerance
    map.forEachFeatureAtPixel(
      pixel,
      function (feature, layer) {
        // Access properties of the clicked feature
        const properties = feature.getProperties();
        updatePopupContent(properties);

        // Set the layer name as the title
        const layerName = layer.get("title");
        document.getElementById("popup-title").innerText = layerName;

        // Set popup position to the clicked coordinate
        popup.setPosition(coordinate);
      },
      {
        hitTolerance: tolerance, // Apply the tolerance value
      }
    );
  });
}

// Function to update the content of the popup with feature properties
function updatePopupContent(properties) {
  // Get references to the input fields
  const idInput = document.getElementById("id-input");
  const nameInput = document.getElementById("name-input");
  const statusInput = document.getElementById("status-input");

  // Set the value of the input fields
  idInput.value = properties.id;
  nameInput.value = properties.name;
  statusInput.value = properties.status;
}

//TRANSACTION TO SAVE DATA USING WFS
// Function to save the changes to the database using WFS transaction
function saveChanges(properties) {
  // Prepare the transaction request XML
  var transactionXML = `
  <wfs:Transaction service="WFS" version="1.0.0"
  xmlns:topp="http://www.openplans.org/topp"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:wfs="http://www.opengis.net/wfs">
  <wfs:Update typeName="test:line">
  <wfs:Property>
  <wfs:Name>id</wfs:Name>
  <wfs:Value>${properties.id}</wfs:Value>
  </wfs:Property>
    <wfs:Property>
      <wfs:Name>name</wfs:Name>
      <wfs:Value>${properties.name}</wfs:Value>
    </wfs:Property>
    <wfs:Property>
    <wfs:Name>status</wfs:Name>
    <wfs:Value>${properties.status}</wfs:Value>
  </wfs:Property>
    <ogc:Filter>
      <ogc:FeatureId fid="${featureID}"/>
    </ogc:Filter>
  </wfs:Update>
</wfs:Transaction>
  `;

  // Send the transaction request to the WFS server
  fetch("http://localhost:8080/geoserver/test/ows", {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
    },
    body: transactionXML,
  })
    .then((response) => response.text())
    .then((data) => {
      // Handle the response from the server
      console.log("Transaction Response:", data);
      // You can show a success message or handle errors here
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Event listener for the save button
const saveButton = document.getElementById("saveButton");
saveButton.addEventListener("click", (e) => {
  // Get the updated properties from the input fields
  const updatedId = document.getElementById("id-input").value;
  const updatedName = document.getElementById("name-input").value;
  const updateStatus = document.getElementById("status-input").value;

  // Create an object with the updated properties
  const updatedProperties = {
    id: updatedId,
    name: updatedName,
    status: updateStatus,
    // Add more properties as needed
  };

  // Call the saveChanges function to save the changes to the database
  saveChanges(updatedProperties);
});

//SAVE TO LAYER
const saveToLayerButton = document.getElementById("saveToLayer");

function updatePropertyID(featureID) {
  url = "http://localhost:8080/geoserver/test/ows";
  featureIDvalue = featureID;

  var updateBody = `
    <wfs:Transaction service="WFS" version="1.0.0"
    xmlns:topp="http://www.openplans.org/topp"
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:wfs="http://www.opengis.net/wfs">
    <wfs:Update typeName="${layerParam}">
    <wfs:Property>
    <wfs:Name>id</wfs:Name>
    <wfs:Value>${featureIDvalue}</wfs:Value>
    </wfs:Property>
      <ogc:Filter>
        <ogc:FeatureId fid="${featureID}"/>
      </ogc:Filter>
    </wfs:Update>
    </wfs:Transaction>
  `;

  const updateOptions = {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
    },
    body: updateBody,
  };

  fetch(url, updateOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      console.log("Property ID updated successfully:", data);
    })
    .catch((error) => {
      console.error("Error updating property ID:", error);
    });
}

saveToLayerButton.addEventListener("click", (e) => {
  // Get all features from the vector source
  const features = wfsVectorSource.getFeatures();

  features.forEach((feature) => {
    const drawnFeatureIds = feature.getId();
    updatePropertyID(drawnFeatureIds);
  });
  wfsVectorSource.refresh();
});
