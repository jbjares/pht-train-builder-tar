
function gen_sparql() {
//	document.getElementById("codde").style.display = "block";

    var create_sparql=0;
    //alert(feat_counter);
    if(feat_counter!='' && feat_counter!=0) {
        create_sparql=1
    }

    if(create_sparql==1)
    {
        var valid = validateForm();

        var inclusions= new Array();
        var inclusions_operator= new Array();
        var inclusions_val= new Array();
        var inclusions_target= new Array();

        var exclusions= new Array();
        var exclusions_operator= new Array();
        var exclusions_val= new Array();
        var exclusions_target= new Array();
        if(incl_cntr!=''&& incl_cntr!=0)
        {
            for(var iter=1;iter<=incl_cntr;iter++)
            {
                if(document.getElementById('inclname'+iter))
                {
                    inclusions[iter]=document.getElementById('inclname'+iter).value;
                    inclusions_operator[iter]=document.getElementById('incl_oprat_val'+iter).value;
                    inclusions_val[iter]=document.getElementById('incl_operat_val_val'+iter).value;
                }
                //~ alert(inclusions_val[iter]+" incl operator"+inclusions_operator[iter]);
            }
        }
        if(cntr!='' && cntr!=0)
        {
            for(var iter=1;iter<=cntr;iter++)
            {
                if(document.getElementById('exclname'+iter))
                {
                    exclusions[iter]=document.getElementById('exclname'+iter).value;
                    exclusions_operator[iter]=document.getElementById('oprat_val'+iter).value;
                    exclusions_val[iter]=document.getElementById('operat_val_val'+iter).value;
                }

            }
        }
        var features= new Array();
        var feats;

        if(feat_counter!='' && feat_counter!=0)
        {
            var feats=1;
            for(var iter=0;iter<=feat_counter;iter++)
            {
                if(document.getElementById('feat_name'+iter))
                {
                    features[feats]=document.getElementById('feat_name'+iter).value;
                    feats++;

                }

            }
        }


        var text = "\n PREFIX pht: <http://datalab.rwth-aachen.de/vocab/pht/>"+"\n prefix xsd: <http://www.w3.org/2001/XMLSchema#> "+"\n prefix sct: <http://purl.bioontology.org/ontology/SNOMEDCT/> "+"\n prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "+"\n PREFIX rcd: <http://purl.bioontology.org/ontology/RCD/>	\n";


        var text = text + "\n SELECT ";

        if(feats!='' && feats!=0)
        {
            for(var iter=1;iter<feats;iter++)
            {


                if(features[iter]!='')
                {
                    var str=val_rc(features[iter]);
                    var res = str.split(" ");
                    var text= text +""+res[1];
                    if(iter!=(feats-1))
                    {
                        var text = text+", ";
                    }
                }
            }

        }

        var text = text+ "\n WHERE { \t ?URI a sct:125676002;";
        if(feats!='' && feats!=0)
        {

            for(var iter=1;iter<feats;iter++)
            {
                var switch_return= val_rc(features[iter]);

                var text= text + "\n \t\t\t "+switch_return;//sct:429019009 ?"+features[iter];//replace sc val
                if(iter!=(feats-1))
                {
                    var text = text+";";
                }
                else
                {
                    var text = text+".";
                }
            }
        }
        if(feats!='' && feats!=0)
        {

            for(var iter=1;iter<feats;iter++)
            {
                if(ret_val(features[iter]))
                {
                    var text= text + '\n \t\t\t VALUES '+ret_val(features[iter]);
                    //(?abc ?def) { \n\t\t\t\t ("ttt" "") \n \t\t }';
                }
            }
        }


        if(incl_cntr!=0 && incl_cntr!='')
        {
            for(var iter=1;iter<=incl_cntr;iter++)
            {
                if(inclusions_operator[iter]==0)
                {
                    var text= text+'\n\t\t FILTER ( ?'+inclusions[iter].toLowerCase()+' = "'+val_rc_filter(inclusions_val[iter])+'" ) .';
                }
                else
                {
                    var text= text+"\n\t\t FILTER ( ?"+inclusions[iter].toLowerCase()+" "+inclusions_operator[iter]+" "+inclusions_val[iter]+" ) .";
                }

            }
        }

        //exclusion
        if(cntr!=0 && cntr!='')
        {
            for(var iter=1;iter<=cntr;iter++)
            {
                if(exclusions_operator[iter]==0)
                {
                    var text= text+"\n\t\t FILTER ( ?"+exclusions[iter].toLowerCase()+" = "+val_rc_filter(exclusions_val[iter])+" ) .";
                }
                else
                {
                    var text= text+"\n\t\t FILTER ( ?"+exclusions[iter].toLowerCase()+" "+exclusions_operator[iter]+" "+exclusions_val[iter]+" ) .";
                }

            }
        }

        var text= text+ "\n\t\t\t} ";
    }

    else
    {
        var text = "\n PREFIX pht: <http://datalab.rwth-aachen.de/vocab/pht/>"+"\n prefix xsd: <http://www.w3.org/2001/XMLSchema#> "+"\n prefix sct: <http://purl.bioontology.org/ontology/SNOMEDCT/> "+"\n prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "+"\n PREFIX rcd: <http://purl.bioontology.org/ontology/RCD/>	\n";

        var text= text+"\n SELECT * WHERE { ?URI a sct:125676002 .}";
    }



//Show SPARQL query
    document.getElementById("codde").innerHTML = text;
    document.getElementById("codde").style.display = "block";
}



function val_rc(to_b_found)
{
    if(to_b_found)
    {

        switch(to_b_found)
        {
            case 'Age':return 'rcd:X7686 ?ageD';
                break;
            case 'Sex':return 'sct:429019009 ?sexS';
                break;
            case 'Chest pain type':return 'sct:29857009 ?cpS';
                break;
            case 'Resting blood pressure':return 'rcd:X773t ?trestbpsD';
                break;
            case 'Serum cholesterol level':return 'rcd:Xa86v ?cholD';
                break;
            case 'Electrocardiographic monitoring':return 'sct:46825001 ?restecgM';
                break;
            case 'Maximum heart rate':return 'sct:428630002 ?thalachD';
                break;
            case 'Cardiovascular stress test using treadmill':return 'rcd:X77by ?exangM';
                break;
            case 'ST segment depression':return 'sct:26141007 ?oldpeakD';
                break;
            case 'Sloping ST segment':return 'sct:251256007 ?slopeI';
                break;
            case 'Cardiac fluoroscopy':return 'sct:82327001 ?caD';
                break;
            case 'Thallium scintigraphy':return 'rcd:F0362 ?thalD';
                break;
            case 'Coronary angiography':return 'sct:33367005 ?numD';
                break;
            default: return '';
                break;
        }
    }
}
function val_rc_filter(to_b_found) {

    if(to_b_found) {

        switch(to_b_found)
        {
            case 'Age':return 'rcd:X7686';
                break;
            case 'Sex':return 'sct:429019009';
                break;
            case 'Chest pain type':return 'sct:29857009';
                break;
            case 'Resting blood pressure':return 'rcd:X773t';
                break;
            case 'Serum cholesterol level':return 'rcd:Xa86v';
                break;
            case 'Electrocardiographic monitoring':return 'sct:46825001';
                break;
            case 'Maximum heart rate':return 'sct:428630002';
                break;
            case 'Cardiovascular stress test using treadmill':return 'rcd:X77by';
                break;
            case 'ST segment depression':return 'sct:26141007';
                break;
            case 'Sloping ST segment':return 'sct:251256007';
                break;
            case 'Cardiac fluoroscopy':return 'sct:82327001';
                break;
            case 'Thallium scintigraphy':return 'rcd:F0362';
                break;
            case 'Coronary angiography':return 'sct:33367005';
                break;
            case 'Male':return 'rcd:X768D';
                break;
            case 'Female':return 'rcd:X767C';
                break;
        }

    }


}
function ret_val(to_b_found)
{
    if(to_b_found)
    {
        switch(to_b_found)
        {

            case 'Sex':return '(?Sex ?SexTypes) { \n\t\t\t\t\t\t\t\t\t\t\t\t\t ("rcd:X768D" "Male") \n\t\t\t\t\t\t\t\t\t\t\t\t\t ("rcd:X767C" "Female") \n\t\t\t\t\t\t\t\t\t }';
                break;
            case 'Chest pain type':return '(?cp ?Chest_Pain_Type) { \n\t\t\t\t\t\t\t\t\t\t\t\t\t ("rcd:X2008" "Typical angina") \n\t\t\t\t\t\t\t\t\t\t\t\t\t ("rcd:XC061" "Asymptomatic") \n\t\t\t\t\t\t\t\t\t\t\t\t\t ("rcd:X200c" "Non-anginal pain") \n\t\t\t\t\t\t\t\t\t\t\t\t\t ("rcd:X2009" "Atypical angina") \n\t\t\t\t\t\t\t\t\t }';
                break;
            case 'Thallium scintigraphy':return '(?thalD ?Thallium_Scintigraphy) { \n\t\t\t\t\t\t\t\t\t\t\t\t\t ("rcd:Xa7s9" "Normal")  \n\t\t\t\t\t\t\t\t\t\t\t\t\t ("rcd:X779A" "Fixed  defect")  \n\t\t\t\t\t\t\t\t\t\t\t\t\t ("rcd:X7798" "Reversible defect") \n\t\t\t\t\t\t\t\t\t }';
                break;

        }

    }


}


function validateForm()
{

    if(feat_counter>0)
    {
        var flg=0;
        for(var j=0;j<=feat_counter;j++)
        {
            if(document.getElementById('feat_check_val'+j))
            {
                if(document.getElementById('feat_check_val'+j).value==1)
                {
                    flg=1;
                }

            }
        }
        if(flg==0)
        {
            document.getElementById('error_feat_check').innerHTML="Please select a target";
            document.getElementById('error_feat_check').style.color="red";
            return false;
        }
    }
    //1
    if(document.getElementById('alg_uid').value=="")
    {
        document.getElementById('error_alg_uid').innerHTML="Algorithm ID cannot be blank";
        document.getElementById('error_alg_uid').style.color="red";
        return false;
    }
    else
    {
        document.getElementById('error_alg_uid').innerHTML="";
    }
    //2
    if(document.getElementById('owner').value=="")
    {
        document.getElementById('error_owner').innerHTML="Please specify an Owner";
        document.getElementById('error_owner').style.color="red";
        return false;
    }
    else
    {
        document.getElementById('error_owner').innerHTML="";
    }
    //3
    if(document.getElementById('access_key').value=="")
    {
        document.getElementById('error_access_key').innerHTML="Access key cannot be blank";
        document.getElementById('error_access_key').style.color="red";
        return false;
    }
    else
    {
        document.getElementById('error_access_key').innerHTML="";
    }
    //4
    if(document.getElementById('purpose').value=="")
    {
        document.getElementById('error_purpose').innerHTML="Please specify purpose of use";
        document.getElementById('error_purpose').style.color="red";
        return false;
    }
    else
    {
        document.getElementById('error_purpose').innerHTML="";
    }
    //5
    if(document.getElementById('meta_data').value=="")
    {
        document.getElementById('error_meta_data').innerHTML="Please select metadata thresold";
        document.getElementById('error_meta_data').style.color="red";
        return false;
    }
    else
    {
        document.getElementById('error_meta_data').innerHTML="";
    }

    //6
    if(document.getElementById('completeness').value=="")
    {
        document.getElementById('error_completeness').innerHTML="Please select data completeness";
        document.getElementById('error_completeness').style.color="red";
        return false;
    }
    else
    {
        document.getElementById('error_completeness').innerHTML="";
    }
    //7
    if(document.getElementById('provenance').value=="")
    {
        document.getElementById('error_provenance').innerHTML="Please select training provenance";
        document.getElementById('error_provenance').style.color="red";
        return false;
    }
    else
    {
        document.getElementById('error_completeness').innerHTML="";
    }
    //8
    if(document.getElementById('algorithm').value=="")
    {
        document.getElementById('error_algorithm').innerHTML="Please select algorithm";
        document.getElementById('error_algorithm').style.color="red";
        return false;
    }
    else
    {
        document.getElementById('error_algorithm').innerHTML="";
    }



}
