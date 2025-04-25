import React, {useEffect} from 'react';
import {MapContainer, Marker, Popup, TileLayer, useMap} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

const position = [51, 0]

function ResetCenterView(props) {
  const {selectPosition} = props;
  const map = useMap();
  useEffect(() =>{
    if(selectPosition){
      map.setView(L.latLng(selectPosition?.lat, selectPosition?.lon), map.getZoom(), {animate : true})
    }
  }, [selectPosition])

  return null;
}

export default function Map(props){
  const {selectPosition} = props;
  const locationSelection = [selectPosition?.lat, selectPosition?.lon];
return(
  <MapContainer center={position} zoom={7} style={{width: '100%', height:'100%'}}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {selectPosition && (
      <Marker position={locationSelection}>
        <Popup>
          {selectPosition.display_name}
        </Popup>
      </Marker>      
    )}
    <ResetCenterView selectPosition={selectPosition}/>

  </MapContainer>
)
}