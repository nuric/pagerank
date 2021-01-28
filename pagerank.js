function getAdjMatrix() {
    var resultM = [];
    //console.log(links.length);

    //For every node
    for (var i = 0; i < nodes.length; ++i) {
        var row = [];
        //Check its links with other nodes
        for (var j = 0; j < nodes.length; ++j) {
            var isThereALink = false;
            for (var k = 0; k < links.length; ++k) {
                if ((links[k].source === nodes[i] && links[k].target === nodes[j] && links[k].right) ||
                    (links[k].source === nodes[j] && links[k].target === nodes[i] && links[k].left)) {
                    isThereALink = true;
                    break;
                }
            }
            //Format the row for the node
            if (isThereALink) {
                row.push(1);
            } else {
                row.push(0);
            }

        }
        //console.log(row.toString());
        resultM.push(row);
    }
    return $M(resultM);
}

function displayR() {
    //Get the adjacency matrix of the active graph
    var M1 = getAdjMatrix();

    //Get damping_value and precision
    var damping_value = document.getElementById("damping_value").value;
    var precision_value = parseInt(document.getElementById("precision_value").value);

    var decimalOffset = Math.pow(10, precision_value);

    //Calculate the pagerank vector and round the results
    var r = M1.pagerank(damping_value);
    for (var i = 0; i < r.length; i++) {
        r[i] = Math.round(r[i] * decimalOffset) / decimalOffset;

    }

    //Update the table with the new pageranks
    var pgTable = document.getElementById("pagerankTable");
    pgTable.innerHTML = "<tr><th>Node ID</th><th>PageRank</th></tr>";

    for (var i = 0; i < nodes.length; ++i) {
        var tdID = document.createElement("td");
        var textID = document.createTextNode(nodes[i].id);
        tdID.appendChild(textID);

        var tdRank = document.createElement("td");
        var textRank = document.createTextNode(r[i]);
        tdRank.appendChild(textRank);

        var trNode = document.createElement("tr");
        trNode.appendChild(tdID);
        trNode.appendChild(tdRank);

        pgTable.appendChild(trNode);
    }
}

Matrix.prototype.row_stochastic = function (damping_factor) {

    var row_length = this.elements[0].length;
    var d = (1 - damping_factor) / row_length;

    var row_total = [];

    for (var x = 0; x < row_length; x++) {
        row_total.push(0);
        for (y = 0; y < row_length; y++) {
            row_total[x] += this.elements[x][y];
        }
    }

    var a1 = this.elements;

    for (var x = 0; x < row_length; x++) {
        for (var y = 0; y < row_length; y++) {
            if (row_total[x] > 0) {
                a1[x][y] = a1[x][y] / row_total[x] + d;
            } else {
                a1[x][y] = (1 / row_length) + d;
            }
        }
    }

    return $M(a1);

}

Vector.prototype.normalize = function () {

    var row_length = this.elements.length;
    var t = 0;

    for (var i = 0; i < row_length; i++) {
        t += this.elements[i];
    }

    return this.multiply((1.0 / t));
}

Matrix.prototype.eigenvector = function () {

    var tolerance = 0.000001;

    var row_length = this.elements[0].length;

    var a = [];

    for (var i = 0; i < row_length; i++) {
        a.push(1);
    }

    var x = $V(a);

    var c_old = 0;

    for (var i = 0; i < 100; i++) {
        var x_new = x.normalize()
        var c_new = x_new.elements[0];

        var e = 100 * (c_new - c_old) / c_new;
        if (Math.abs(e) < tolerance) {
            break;
        }

        x = this.multiply(x_new);
        c_old = c_new;
    }

    return $V(x);

}

Matrix.prototype.pagerank = function (damping_value) {
    //Manual damping_value set here
    //var damping_value = 0.85;
    var row_stochastic_matrix = this.row_stochastic(damping_value);
    var transposed_matrix = row_stochastic_matrix.transpose();
    var eigenvector = transposed_matrix.eigenvector();
    var normalized_eigenvector = eigenvector.normalize();
    return normalized_eigenvector.elements;
}