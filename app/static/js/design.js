let incl_cntr = 0;
let cntr = 0;

function show_incl_inp() {

    if($(".excl_test").is(":visible")) {

        alert("Please Complete Exclusion criteria");

    } else {

        $(".incl_test").show();
        $("#incl_ops").show();
        $("#incl_ops_check").show();
    }
}

function incl_func() {

    document.getElementById("inclname_1").style.display = "block";

    const input = document.getElementById('incl_name');
    const filter = input.value.toUpperCase();
    const ul = document.getElementById("inclname_1");
    const li = ul.getElementsByTagName('li');

    // Loop through all list items, and hide those who don't match the search query
    for (let i = 0; i < li.length; i++) {

        const a = li[i].getElementsByTagName("a")[0];

        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}



function incl_add_for_search(q,w) {

    const incl_abc = $("#incl_nm1_"+w).attr("value");
    const incl_exist = val_rc(incl_abc);

    if(incl_exist) {

        $("#incl_operat").hide();
        $("#incl_operat_val").hide();
        $("#incl_sel_op_val1").hide();
        incl_abc1=$("#incl_nm1_"+w).attr("data-value");
        document.getElementById("incl_name").value=incl_abc;
        document.getElementById("incl_ip_type").value=incl_abc1;

        $("#inclname_1").hide();
        if(incl_abc1 === "string") {

            $("#incl_operat_val").show();
            $("#incl_sel_op_val").show();
            $("#incl_sel_op_val1").hide();

        } else {
            $("#incl_operat").show();
            $("#incl_operat_val").show();
            $("#incl_sel_op_val1").show();
            $("#incl_sel_op_val").hide();
        }


        //ajax
        $.ajax({
            type: "get",
            async: true,
            url: "ajax_result.php",
            data: {'id':incl_abc},
            dataType: "json",
            success: function(res) {

                console.log(res);

                if(res.length>0) {
                    for(var i=0; i<res.length; i++)
                    {
                        var city_name_val = res[i];
                        var id_val = res[i];

                        $("#incl_sel_op_val").append('<option value="'+city_name_val+'">'+city_name_val+'</option>');
                    }
                }
                else {
                    //~ $(".perds").remove();
                }
            }
        });
    }
    else {

        alert("That value cannot be selected!Please change");
    }
}



function incl_insertable()
{

    var exclnamearray=new Array();
    var excloperatvalarray=new Array();
    var excloperatval_val_array =new Array();
    for(var iter=1;iter<=cntr;iter++)
    {


        //~ if(document.getElementById("exclname"+iter).value=='')
        if(document.getElementById("exclname"+iter))
        {

            exclnamearray[iter] = document.getElementById("exclname"+iter).value;
            excloperatvalarray[iter] = document.getElementById("oprat_val"+iter).value;
            excloperatval_val_array[iter] = document.getElementById("operat_val_val"+iter).value;
        }
        else
        {
            exclnamearray[iter] = 0;
            excloperatvalarray[iter] = 0;
            excloperatval_val_array[iter] = 0;


        }
    }

    var incl_nam_val=document.getElementById("incl_name").value;
    var incl_operat_val=document.getElementById("incl_sel_val").value;
    var incl_operat_val_val=document.getElementById("incl_sel_op_val").value;
    var incl_operat_val_val1=document.getElementById("incl_sel_op_val1").value;
    var incl_type_val=document.getElementById("incl_ip_type").value;
    var flag=0;
    //~ alert(type_val);
    if(document.getElementById("incl_ip_type").value=='')
    {
        flg=0;
    }
    else
    {
        if(document.getElementById("incl_name").value=='')
        {
            flg=0;
        }
        if(incl_type_val=="string")
        {
            if(document.getElementById("incl_sel_op_val").value=='')
            {
                flg=0;
            }
            else
            {
                flg=1;
            }
        }
        else
        {
            if(document.getElementById("incl_sel_val").value=='')
            {
                flg=0;
            }
            if(document.getElementById("incl_sel_op_val1").value=='')
            {
                flg=0;
            }
            else
            {
                flg=1;
            }
        }



    }
    //~ alert(flg);
    var can_add=1;
    var can_add_same=0;
    if(flg==1)
    {

        for(iter=1;iter<=incl_cntr;iter++)
        {
            if(incl_nam_val==document.getElementById("inclname"+iter).value)
            {
                //~ document.getElementById('error_gender').innerHTML="Feature is already added.";
                document.getElementById("err_incl_name").innerHTML="This Criteria has been selected";
                document.getElementById("err_incl_name").style.color="red";
                can_add_same=1;
            }

        }
        if(can_add_same==0)
        {

            for(iter=1;iter<=cntr;iter++)
            {


                if(exclnamearray[iter]==document.getElementById("incl_name").value)
                {

                    if(incl_type_val=="string")
                    {
                        if(excloperatval_val_array[iter]==document.getElementById("incl_sel_op_val").value)
                        {
                            alert("The same value exists in exclusion criteria!Please change");
                            can_add=0;
                        }
                        //~ excloperatval_val_array
                        //~ excloperatvalarray

                    }

                    else
                    {
                        if(excloperatval_val_array[iter]==document.getElementById("incl_sel_op_val1").value)
                        {
                            if(excloperatvalarray[iter]==document.getElementById("incl_sel_val").value)
                            {

                                alert("The same value exists in exclusion criteria!Please change");
                                can_add=0;
                            }
                        }
                    }
                }
            }


        }


        if(can_add==1 && can_add_same==0)
        {
            document.getElementById("incl_name").value='';
            incl_cntr++;
            $(".incl_test").hide();
            $("#incl_ops").hide();
            $("#incl_operat").hide();
            $("#incl_operat_val").hide();

            $("#nw_"+incl_cntr+"").css("border-color","#333");
            $("#nw_"+incl_cntr+"").css("border-width","1px");
            $("#nw_"+incl_cntr+"").css("border-style","solid");
            $("#nw_"+incl_cntr+"").css("background-color","#fefefe");
            $("#nw_"+incl_cntr+"").css("","3px");

            if(incl_type_val=="string")
            {
                //~ $("#incl_insertable_val").append('<span class="incl_nw_'+incl_cntr+'"><br/><br/></span><input type="" name="incl_name_val[]"  id="inclname'+incl_cntr+'" class="grey incl_nw_'+incl_cntr+'" value="'+incl_nam_val+'" readonly/>	<input type="hidden" name="oprat_val[]" id="incl_oprat_val'+incl_cntr+'" class="incl_nw_'+incl_cntr+'" value="0"/><input type="" name="operat_val_val[]" id="incl_operat_val_val'+incl_cntr+'" class="grey incl_nw_'+incl_cntr+'" value="'+incl_operat_val_val+'" readonly style="margin-left:3px;margin-right:3px;"/><input type="hidden" name="incl_check_val[]" id="incl_check_val'+incl_cntr+'" value="0"><input class="incl_cnt'+incl_cntr+'" id="incl_cb'+incl_cntr+'" type="checkbox" name="incl_checkbox[]" value="1" onclick="incl_check_selectbox(this,'+incl_cntr+' )">	<a class="mybtn incl_nw_'+incl_cntr+'" onclick="incl_hidecntr('+incl_cntr+')"><i class="fa fa-times"></i></a>');
                $("#incl_insertable_val").append('<span class="incl_nw_'+incl_cntr+'"><br/><br/></span><input type="" name="incl_name_val[]"  id="inclname'+incl_cntr+'" class="grey incl_nw_'+incl_cntr+'" value="'+incl_nam_val+'" readonly/>	<input type="hidden" name="oprat_val[]" id="incl_oprat_val'+incl_cntr+'" class="incl_nw_'+incl_cntr+'" value="0"/><input type="" name="operat_val_val[]" id="incl_operat_val_val'+incl_cntr+'" class="grey incl_nw_'+incl_cntr+'" value="'+incl_operat_val_val+'" readonly style="margin-left:3px;margin-right:3px;"/><input type="hidden" name="incl_check_val[]" id="incl_check_val'+incl_cntr+'" value="0">	<a class="mybtn incl_nw_'+incl_cntr+'" onclick="incl_hidecntr('+incl_cntr+')"><i class="fa fa-times"></i></a>');
            }
            else
            {
                //~ $("#incl_insertable_val").append('<span class="incl_nw_'+incl_cntr+'"><br/><br/></span> <input type="" name="incl_name_val[]" id="inclname'+incl_cntr+'" class="grey incl_nw_'+incl_cntr+'" value="'+incl_nam_val+'" readonly/>	<input type="" name="oprat_val[]" id="incl_oprat_val'+incl_cntr+'" class="grey incl_nw_'+incl_cntr+'" value="'+incl_operat_val+'" readonly/><input type="" name="operat_val_val[]" id="incl_operat_val_val'+incl_cntr+'" class="grey incl_nw_'+incl_cntr+'" value="'+incl_operat_val_val1+'" readonly style="margin-left:3px;margin-right:3px;"/><input type="hidden" name="incl_check_val[]" id="incl_check_val'+incl_cntr+'" value="0"><input class="incl_cnt'+incl_cntr+'" id="incl_cb'+incl_cntr+'" type="checkbox" name="incl_checkbox[]" value="1"  onclick="incl_check_selectbox(this,'+incl_cntr+' )">	<a class="mybtn incl_nw_'+incl_cntr+'" onclick="incl_hidecntr('+incl_cntr+')"><i class="fa fa-times"></i></a>');
                $("#incl_insertable_val").append('<span class="incl_nw_'+incl_cntr+'"><br/><br/></span> <input type="" name="incl_name_val[]" id="inclname'+incl_cntr+'" class="grey incl_nw_'+incl_cntr+'" value="'+incl_nam_val+'" readonly/>	<input type="" name="oprat_val[]" id="incl_oprat_val'+incl_cntr+'" class="grey incl_nw_'+incl_cntr+'" value="'+incl_operat_val+'" readonly/><input type="" name="operat_val_val[]" id="incl_operat_val_val'+incl_cntr+'" class="grey incl_nw_'+incl_cntr+'" value="'+incl_operat_val_val1+'" readonly style="margin-left:3px;margin-right:3px;"/><input type="hidden" name="incl_check_val[]" id="incl_check_val'+incl_cntr+'" value="0">	<a class="mybtn incl_nw_'+incl_cntr+'" onclick="incl_hidecntr('+incl_cntr+')"><i class="fa fa-times"></i></a>');
            }

            document.getElementById("incl_name").value='';
            document.getElementById("incl_sel_op_val1").value='';
            $('#incl_sel_op_val').children().remove();
        }

    }
    else
    {
        alert("Please fill all the fields to continue");
    }

}



function incl_remove_insertable()
{
    document.getElementById("incl_name").value='';
    document.getElementById("incl_sel_op_val1").value='';
    $('#incl_sel_op_val').children().remove();

    $(".incl_test").hide();
    $("#incl_ops").hide();
    $("#incl_operat").hide();
    $("#incl_operat_val").hide();

}


function incl_hidecntr(incl_cnt)
{
    $('.incl_nw_'+incl_cnt+'').remove();
    $('.incl_cnt'+incl_cnt+'').remove();
}





var incl_a=0;
function  incl_check_selectbox(incl_cb,incl_sel_id)
{

    if(incl_cb.checked==true)
    {

        incl_a++;

        if(incl_a>=1)
        {

            if(incl_a!=1)
            {

                $('#incl_cb'+incl_sel_id+'').prop('checked', false);

                document.getElementById('incl_check_val'+incl_sel_id+'').value=0;
                incl_a--;
            }
            else
            {

                document.getElementById('incl_check_val'+incl_sel_id+'').value=1;
            }
        }

    }
    else if(incl_cb.checked==false)
    {

        incl_a--;
        document.getElementById('incl_check_val'+incl_sel_id+'').value=0;

    }

}


function show_excl_inp()
{
    if($(".incl_test").is(":visible"))
    {
        alert("Please Complete Inclusion criteria");
    }
    else
    {
        $(".excl_test").show();
        $("#ops").show();
        $("#ops_check").show();
    }
}

function insertable()
{

    var inclnamearray=new Array();
    var incloperatvalarray=new Array();
    var incloperatval_val_array =new Array();

    for(var iter=1;iter<=incl_cntr;iter++)
    {



        //~ if(document.getElementById("exclname"+iter).value=='') id="'+cntr+'"
        if(document.getElementById("inclname"+iter))
        {


            inclnamearray[iter] = document.getElementById("inclname"+iter).value;
            incloperatvalarray[iter] = document.getElementById("incl_oprat_val"+iter).value;
            incloperatval_val_array[iter] = document.getElementById("incl_operat_val_val"+iter).value;
        }
        else
        {
            inclnamearray[iter] = 0;
            incloperatvalarray[iter] = 0;
            incloperatval_val_array[iter] = 0;


        }
    }



    var nam_val=document.getElementById("excl_name").value;
    var operat_val=document.getElementById("sel_val").value;
    var operat_val_val=document.getElementById("sel_op_val").value;
    var operat_val_val1=document.getElementById("sel_op_val1").value;
    var type_val=document.getElementById("ip_type").value;


    var flg1;
    if(document.getElementById("ip_type").value=='')
    {
        flg1=0;
    }
    else
    {
        if(document.getElementById("excl_name").value=='')
        {
            flg1=0;
        }
        if(type_val=="string")
        {
            if(document.getElementById("sel_op_val").value=='')
            {
                flg1=0;
            }
            else
            {
                flg1=1;
            }
        }
        else
        {
            if(document.getElementById("sel_val").value=='')
            {
                flg1=0;
            }
            if(document.getElementById("sel_op_val1").value=='')
            {
                flg1=0;
            }
            else
            {
                flg1=1;
            }
        }



    }

    var can_add_1=1;
    var can_add_1_same=0;
    if(flg1==1)
    {
        for(iter=1;iter<=cntr;iter++)
        {
            if(nam_val==document.getElementById("exclname"+iter).value)
            {
                //~ document.getElementById('error_gender').innerHTML="Feature is already added.";
                document.getElementById("err_excl_name").innerHTML="This Criteria has been selected";
                document.getElementById("err_excl_name").style.color="red";
                can_add_1_same=1;
            }

        }

        if(can_add_1_same==0)
        {
            for(iter=1;iter<=incl_cntr;iter++)
            {


                if(inclnamearray[iter]==document.getElementById("excl_name").value)
                {

                    if(type_val=="string")
                    {
                        if(incloperatval_val_array[iter]==document.getElementById("sel_op_val").value)
                        {
                            alert("The same value exists in exclusion criteria!Please change");
                            can_add_1=0;
                        }
                        //~ excloperatval_val_array
                        //~ excloperatvalarray

                    }

                    else
                    {

                        if(incloperatval_val_array[iter]==document.getElementById("sel_op_val1").value)
                        {
                            if(incloperatvalarray[iter]==document.getElementById("sel_val").value)
                            {

                                alert("The same value exists in exclusion criteria!Please change");
                                can_add_1=0;
                            }
                        }
                    }
                }
            }


        }

        if(can_add_1==1 && can_add_1_same==0)
        {
            document.getElementById("excl_name").value='';
            cntr++;
            $(".excl_test").hide();
            $("#ops").hide();
            $("#operat").hide();
            $("#operat_val").hide();

            $("#nw_"+cntr+"").css("border-color","#333");
            $("#nw_"+cntr+"").css("border-width","1px");
            $("#nw_"+cntr+"").css("border-style","solid");
            $("#nw_"+cntr+"").css("background-color","#fefefe");
            $("#nw_"+cntr+"").css("","3px");

            if(type_val=="string")
            {
                //~ $("#insertable_val").append('<span class="nw_'+cntr+'"><br/><br/></span><input type="" name="name_val[]" id="exclname'+cntr+'" class="grey nw_'+cntr+'" value="'+nam_val+'" readonly/>	<input type="hidden" name="excl_oprat_val[]" id="oprat_val'+cntr+'" class="nw_'+cntr+'" value="0"/><input type="" name="excl_operat_val_val[]" id="operat_val_val'+cntr+'" class="grey nw_'+cntr+'" value="'+operat_val_val+'" readonly style="margin-left:3px;margin-right:3px;"/><input type="hidden" name="excl_check_val[]" id="excl_check_val'+cntr+'" value="0"><input class="cnt'+cntr+'" id="cb'+cntr+'" type="checkbox" name="excl_checkbox[]" value="1" onclick="check_selectbox(this,'+cntr+' )">	<a class="mybtn nw_'+cntr+'" onclick="hidecntr('+cntr+')"><i class="fa fa-times"></i></a>');
                $("#insertable_val").append('<span class="nw_'+cntr+'"><br/><br/></span><input type="" name="name_val[]" id="exclname'+cntr+'" class="grey nw_'+cntr+'" value="'+nam_val+'" readonly/>	<input type="hidden" name="excl_oprat_val[]" id="oprat_val'+cntr+'" class="nw_'+cntr+'" value="0"/><input type="" name="excl_operat_val_val[]" id="operat_val_val'+cntr+'" class="grey nw_'+cntr+'" value="'+operat_val_val+'" readonly style="margin-left:3px;margin-right:3px;"/><input type="hidden" name="excl_check_val[]" id="excl_check_val'+cntr+'" value="0">	<a class="mybtn nw_'+cntr+'" onclick="hidecntr('+cntr+')"><i class="fa fa-times"></i></a>');
            }
            else
            {
                //~ $("#insertable_val").append('<span class="nw_'+cntr+'"><br/><br/></span> <input type="" name="name_val[]" id="exclname'+cntr+'" class="grey nw_'+cntr+'" value="'+nam_val+'" readonly/>	<input type="" name="excl_oprat_val[]" id="oprat_val'+cntr+'" class="grey nw_'+cntr+'" value="'+operat_val+'" readonly/><input type="" name="excl_operat_val_val[]" id="operat_val_val'+cntr+'" class="grey nw_'+cntr+'" value="'+operat_val_val1+'" readonly style="margin-left:3px;margin-right:3px;"/><input type="hidden" name="excl_check_val[]" id="excl_check_val'+cntr+'" value="0"><input class="cnt'+cntr+'" id="cb'+cntr+'" type="checkbox" name="excl_checkbox[]" value="1"  onclick="check_selectbox(this,'+cntr+' )">	<a class="mybtn nw_'+cntr+'" onclick="hidecntr('+cntr+')"><i class="fa fa-times"></i></a>');
                $("#insertable_val").append('<span class="nw_'+cntr+'"><br/><br/></span> <input type="" name="name_val[]" id="exclname'+cntr+'" class="grey nw_'+cntr+'" value="'+nam_val+'" readonly/>	<input type="" name="excl_oprat_val[]" id="oprat_val'+cntr+'" class="grey nw_'+cntr+'" value="'+operat_val+'" readonly/><input type="" name="excl_operat_val_val[]" id="operat_val_val'+cntr+'" class="grey nw_'+cntr+'" value="'+operat_val_val1+'" readonly style="margin-left:3px;margin-right:3px;"/><input type="hidden" name="excl_check_val[]" id="excl_check_val'+cntr+'" value="0">	<a class="mybtn nw_'+cntr+'" onclick="hidecntr('+cntr+')"><i class="fa fa-times"></i></a>');
            }

            document.getElementById("excl_name").value='';
            document.getElementById("sel_op_val1").value='';
            $('#sel_op_val').children().remove();

        }



    }
    else
    {
        alert("Please fill all the fields to continue");
    }


}
function remove_insertable()
{
    document.getElementById("excl_name").value='';
    document.getElementById("sel_op_val1").value='';
    $('#sel_op_val').children().remove();

    $(".excl_test").hide();
    $("#ops").hide();
    $("#operat").hide();
    $("#operat_val").hide();

}
function add_for_search(q,w)
{
    abc=$("#nm1_"+w+"").attr("value");
    var excl_exist=val_rc(abc);
    if(excl_exist!='')
    {
        $("#operat").hide();
        $("#operat_val").hide();
        $("#sel_op_val1").hide();


        abc1=$("#nm1_"+w+"").attr("data-value");
        document.getElementById("excl_name").value=abc;
        document.getElementById("ip_type").value=abc1;
        //~ alert(abc);
        $("#exclname_1").hide();
        if(abc1=="string")
        {
            $("#operat_val").show();
            $("#sel_op_val").show();
            $("#sel_op_val1").hide();
        }
        else
        {
            $("#operat").show();
            $("#operat_val").show();
            $("#sel_op_val1").show();
            $("#sel_op_val").hide();
        }

        //ajax
        $.ajax({
            type: "get",
            async: true,
            url: "ajax_result.php",
            data: {'id':abc},
            dataType: "json",
            success: function(res) {

                console.log(res);



                if(res.length>0)
                {
                    for(var i=0; i<res.length; i++)
                    {
                        var city_name_val = res[i];
                        var id_val = res[i];

                        $("#sel_op_val").append('<option value="'+city_name_val+'">'+city_name_val+'</option>');
                    }
                }
                else
                {
                    $(".perds").remove();
                }
            }

        });


    }
    else
    {
        alert("That value cannot be selected!Please change");
    }



}
function excl_func(disp_val) {


    document.getElementById("exclname_1").style.display = "block";

    // Declare variables



    var input, filter, ul, li, a, i;
    input = document.getElementById('excl_name');
    filter = input.value.toUpperCase();
    ul = document.getElementById("exclname_1");
    li = ul.getElementsByTagName('li');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

function hidecntr(cnt) {
    $('.nw_'+cnt+'').remove();
    $('.cnt'+cnt+'').remove();
}


var a=0;
function  check_selectbox(cb,sel_id)
{

    if(cb.checked==true)
    {

        a++;

        if(a>=1)
        {

            if(a!=1)
            {

                $('#cb'+sel_id+'').prop('checked', false);
                document.getElementById('excl_check_val'+sel_id+'').value=0;
                a--;
            }
            else
            {
                document.getElementById('excl_check_val'+sel_id+'').value=1;
            }
        }

    }
    else if(cb.checked==false)
    {
        document.getElementById('excl_check_val'+sel_id+'').value=0;
        a--;

    }
}



function rem_feat()
{
    document.getElementById('feature').value='';
    $("#feat_ops_rem").hide();
    $("#feat_ops_check").hide();
    $("#feature").hide();
    $("#feature_1").hide();
}

function add_feat()
{

    $("#feature_add").show();
    $("#feat_ops_rem").show();
    $("#feat_ops_check").show();
    $("#feature").show();
}
var feat_counter=0;
function add_feature_to_search(disp_val)
{
    document.getElementById('feature').value=disp_val;
    $("#feature_1").hide();
}


function add_feature(disp_val) {


    document.getElementById("feature_1").style.display = "block";

    // Declare variables



    var input, filter, ul, li, a, i;
    input = document.getElementById('feature');
    filter = input.value.toUpperCase();
    ul = document.getElementById("feature_1");
    li = ul.getElementsByTagName('li');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

function add_feature_func()
{
    var can_add_feat=0;
    var feat_val=document.getElementById('feature').value;
    if(feat_val!='')
    {

        var feat_exist=val_rc(feat_val);
        if(feat_exist!='')
        {
            document.getElementById('error_feat_exist').innerHTML="";
            for(var iter=0;iter<feat_counter;iter++)
            {
                if(document.getElementById('feat_name'+iter))
                {
                    if(feat_val==document.getElementById('feat_name'+iter).value)
                    {
                        can_add_feat=1;
                    }
                }

            }
            if(can_add_feat==1)
            {
                document.getElementById('error_feat_exist').innerHTML="Feature is already added.";
                document.getElementById('error_feat_exist').style.color="red";
            }
            else
            {
                document.getElementById('error_feat_exist').innerHTML="";
                $("#added_feature").append('<span class="nw_'+feat_counter+'"><br/><br/></span>	<input type="" name="feat_name_val[]" id="feat_name'+feat_counter+'" class="grey nw_'+feat_counter+'" value="'+feat_val+'" readonly/><input type="hidden" name="feat_check_val[]" id="feat_check_val'+feat_counter+'" value="0"/><input class="cnt'+feat_counter+'" id="feat_cb'+feat_counter+'" type="checkbox" name="vehicle" value="1" onclick="feat_check_selectbox(this,'+feat_counter+' )"><a class="mybtn nw_'+feat_counter+'" onclick="hide_feat_cntr('+feat_counter+')"><i class="fa fa-times"></i></a>');
                $("#feature_1").hide();
                document.getElementById('feature').value='';
                feat_counter++;
            }
        }
        else
        {
            document.getElementById('error_feat_exist').innerHTML="Feature cannot be selected.";
            document.getElementById('error_feat_exist').style.color="red";
        }
        //~ $("#feat"+cntr_feat+"").attr('data-value');


    }



}
function hide_feat_cntr(ft)
{

    $('.nw_'+ft+'').remove();
    $('.cnt'+ft+'').remove();
    $("#feature_1").hide();
    feat_counter--;
}


feat_cnt=0;
function feat_check_selectbox(feat_cb,feat_sel_id)
{
    if(feat_cb.checked==true)
    {

        feat_cnt++;

        if(feat_cnt>=1)
        {

            if(feat_cnt!=1)
            {

                $('#feat_cb'+feat_sel_id+'').prop('checked', false);

                document.getElementById('error_feat_check').innerHTML="Target is already selected. Please unselect current target to change target";
                document.getElementById('error_feat_check').style.color="red";
                document.getElementById('feat_check_val'+feat_sel_id+'').value=0;
                feat_cnt--;
            }
            else
            {
                document.getElementById('error_feat_check').innerHTML="";
                document.getElementById('feat_check_val'+feat_sel_id+'').value=1;
            }
        }

    }
    else if(feat_cb.checked==false)
    {
        document.getElementById('feat_check_val'+feat_sel_id+'').value=0;
        feat_cnt--;

    }
}